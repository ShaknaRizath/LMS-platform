import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { NotificationItem } from "@/lib/notifications/student-feed";

const FEED_LIMIT = 8;

/**
 * In-app notification feed for the Academic Director's header bell — previously this role only
 * got getStaffLeaveNotifications (their own leave decisions), so newly filed discipline cases
 * (a Coordinator files, the Academic Director resolves — see the Scholarships + Discipline
 * batch) never surfaced in the bell even though resolving them is this role's own action queue.
 */
export async function getAcademicDirectorNotifications(userId: string): Promise<NotificationItem[]> {
  const [decidedLeaveRequests, openDisciplineCases] = await Promise.all([
    prisma.staffLeaveRequest.findMany({
      where: { staffId: userId, status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { decidedAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.disciplineCase.findMany({
      where: { status: "OPEN" },
      include: { student: true, reportedBy: true },
      orderBy: { createdAt: "desc" },
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
    ...openDisciplineCases.map((disciplineCase) => ({
      id: `discipline-case-${disciplineCase.id}`,
      title: "Discipline case awaiting resolution",
      detail: `${disciplineCase.student.firstName} ${disciplineCase.student.lastName} · reported by ${disciplineCase.reportedBy.firstName} ${disciplineCase.reportedBy.lastName}`,
      date: disciplineCase.createdAt,
      href: `/academic/discipline`,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, FEED_LIMIT);
}
