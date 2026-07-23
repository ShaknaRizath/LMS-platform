import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { NotificationItem } from "@/lib/notifications/student-feed";

const FEED_LIMIT = 8;

/**
 * In-app notification feed for the Marketing Officer's header bell — previously this role only
 * got getStaffLeaveNotifications (their own leave decisions), so new prospective-student
 * applications (their whole reason for having an Applications queue at all) never surfaced in
 * the bell.
 */
export async function getMarketingNotifications(userId: string): Promise<NotificationItem[]> {
  const [decidedLeaveRequests, pendingApplications] = await Promise.all([
    prisma.staffLeaveRequest.findMany({
      where: { staffId: userId, status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { decidedAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.application.findMany({
      where: { status: "PENDING" },
      include: { program: true },
      orderBy: { submittedAt: "desc" },
      take: FEED_LIMIT,
    }),
  ]);

  return [
    ...decidedLeaveRequests.map((request) => ({
      id: `leave-request-${request.id}`,
      title: `Leave request ${request.status === "APPROVED" ? "approved" : "rejected"}`,
      detail: `${request.type} · ${request.startDate.toLocaleDateString()} – ${request.endDate.toLocaleDateString()}`,
      date: request.decidedAt!,
      href: "/staff/leave",
    })),
    ...pendingApplications.map((application) => ({
      id: `application-${application.id}`,
      title: "New application submitted",
      detail: `${application.firstName} ${application.lastName} · ${application.program.name}`,
      date: application.submittedAt,
      href: "/marketing/applications",
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, FEED_LIMIT);
}
