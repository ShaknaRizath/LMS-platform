import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { NotificationItem } from "@/lib/notifications/student-feed";

const FEED_LIMIT = 8;

/**
 * Minimal in-app notification feed for header bells on roles with no richer role-specific feed
 * yet (currently just Library Officer) — just the staff member's own leave request decisions.
 * Same shape/read-state mechanism as getStudentNotifications, so it slots into DashboardShell's
 * notifications prop as-is. Every other role (Admin, Academic Director, Coordinator, Examination
 * Unit, Finance, HR, Lecturer, Marketing) now has its own richer feed instead of this one.
 */
export async function getStaffLeaveNotifications(userId: string): Promise<NotificationItem[]> {
  const decidedLeaveRequests = await prisma.staffLeaveRequest.findMany({
    where: { staffId: userId, status: { in: ["APPROVED", "REJECTED"] } },
    orderBy: { decidedAt: "desc" },
    take: FEED_LIMIT,
  });

  return decidedLeaveRequests.map((request) => ({
    id: `leave-request-${request.id}`,
    title: `Leave request ${request.status === "APPROVED" ? "approved" : "rejected"}`,
    detail: `${request.type} · ${request.startDate.toLocaleDateString()} – ${request.endDate.toLocaleDateString()}`,
    date: request.decidedAt!,
    href: "/staff/leave",
  }));
}
