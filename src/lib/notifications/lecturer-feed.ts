import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { NotificationItem } from "@/lib/notifications/student-feed";

const FEED_LIMIT = 8;

/**
 * In-app notification feed for the Lecturer header bell — the staff member's own leave
 * request decisions (HR approving/rejecting a request they filed) plus new ungraded
 * assignment submissions waiting on them. Same per-item read-state mechanism as
 * getStudentNotifications (NotificationRead, keyed by this item's id).
 */
export async function getLecturerNotifications(lecturerId: string): Promise<NotificationItem[]> {
  const [decidedLeaveRequests, ungradedSubmissions] = await Promise.all([
    prisma.staffLeaveRequest.findMany({
      where: { staffId: lecturerId, status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { decidedAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.submission.findMany({
      where: {
        gradedAt: null,
        contentItem: { isAssignment: true, week: { module: { lecturerAssignments: { some: { lecturerId } } } } },
      },
      include: { contentItem: { include: { week: { include: { module: true } } } }, student: true },
      orderBy: { submittedAt: "desc" },
      take: FEED_LIMIT,
    }),
  ]);

  const items: NotificationItem[] = [
    ...decidedLeaveRequests.map((request) => ({
      id: `leave-request-${request.id}`,
      title: `Leave request ${request.status === "APPROVED" ? "approved" : "rejected"}`,
      detail: `${request.type} · ${request.startDate.toLocaleDateString()} – ${request.endDate.toLocaleDateString()}`,
      date: request.decidedAt!,
      href: "/staff/leave",
    })),
    ...ungradedSubmissions.map((submission) => ({
      id: `submission-${submission.id}`,
      title: `New submission — "${submission.contentItem.title}"`,
      detail: `${submission.contentItem.week.module.code} · ${submission.student.firstName} ${submission.student.lastName}`,
      date: submission.submittedAt,
      href: `/lecturer/modules/${submission.contentItem.week.moduleId}`,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, FEED_LIMIT);

  return items;
}
