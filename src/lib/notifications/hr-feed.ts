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
 * awaiting a decision, staff contracts expiring within 30 days (mirrors the dashboard's own
 * "Contracts expiring" stat), and the officer's own leave decisions (HR can file leave too, and
 * — per decideLeaveRequest's allowed roles — Admin/SuperAdmin, not just HR, can decide it). Same
 * per-item read-state mechanism as getStudentNotifications (NotificationRead, keyed by this
 * item's id), so it slots into DashboardShell's existing notifications prop as-is.
 */
export async function getHrNotifications(userId: string): Promise<NotificationItem[]> {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [pending, decidedOwnLeave, contractsExpiring] = await Promise.all([
    prisma.staffLeaveRequest.findMany({
      where: { status: "PENDING" },
      include: { staff: true },
      orderBy: { createdAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.staffLeaveRequest.findMany({
      where: { staffId: userId, status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { decidedAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.user.findMany({
      where: { contractEndDate: { gte: now, lte: in30Days } },
      orderBy: { contractEndDate: "asc" },
      take: FEED_LIMIT,
    }),
  ]);

  return [
    ...pending.map((request) => ({
      id: `leave-request-${request.id}`,
      title: `${LEAVE_TYPE_LABELS[request.type] ?? request.type} request`,
      detail: `${request.staff.firstName} ${request.staff.lastName} · ${request.startDate.toLocaleDateString()} – ${request.endDate.toLocaleDateString()}`,
      date: request.createdAt,
      href: `/hr/staff/${request.staffId}`,
    })),
    ...decidedOwnLeave.map((request) => ({
      id: `leave-request-own-${request.id}`,
      title: `Leave request ${request.status === "APPROVED" ? "approved" : "rejected"}`,
      detail: `${request.type} · ${request.startDate.toLocaleDateString()} – ${request.endDate.toLocaleDateString()}`,
      date: request.decidedAt!,
      href: "/staff/leave",
    })),
    ...contractsExpiring.map((staff) => ({
      id: `contract-expiring-${staff.id}`,
      title: "Staff contract expiring soon",
      detail: `${staff.firstName} ${staff.lastName} · ends ${staff.contractEndDate!.toLocaleDateString()}`,
      date: now,
      href: `/hr/staff/${staff.id}`,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, FEED_LIMIT);
}
