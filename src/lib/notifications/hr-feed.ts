import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { NotificationItem } from "@/lib/notifications/student-feed";

const FEED_LIMIT = 8;

const LEAVE_TYPE_LABELS: Record<string, string> = {
  ANNUAL: "Annual leave",
  SICK: "Sick leave",
  UNPAID: "Unpaid leave",
  OTHER: "Leave",
};

/**
 * In-app notification feed for the HR Officer's header bell — staff leave requests still
 * awaiting a decision. Same per-item read-state mechanism as getStudentNotifications
 * (NotificationRead, keyed by this item's id), so it slots into DashboardShell's existing
 * notifications prop as-is. Items naturally drop off the feed once decided (no longer PENDING).
 */
export async function getHrNotifications(): Promise<NotificationItem[]> {
  const pending = await prisma.staffLeaveRequest.findMany({
    where: { status: "PENDING" },
    include: { staff: true },
    orderBy: { createdAt: "desc" },
    take: FEED_LIMIT,
  });

  return pending.map((request) => ({
    id: `leave-request-${request.id}`,
    title: `${LEAVE_TYPE_LABELS[request.type] ?? request.type} request`,
    detail: `${request.staff.firstName} ${request.staff.lastName} · ${request.startDate.toLocaleDateString()} – ${request.endDate.toLocaleDateString()}`,
    date: request.createdAt,
    href: `/hr/staff/${request.staffId}`,
  }));
}
