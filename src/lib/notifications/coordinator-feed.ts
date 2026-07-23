import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { NotificationItem } from "@/lib/notifications/student-feed";

const FEED_LIMIT = 8;

const OUTCOME_LABELS: Record<string, string> = {
  NONE: "No action",
  WARNING: "Warning",
  SUSPENSION: "Suspension",
  EXPULSION: "Expulsion",
};

/**
 * In-app notification feed for a Program Coordinator's header bell — discipline cases they
 * filed that the Academic Director has since resolved, plus their own leave request decisions
 * (same baseline every other staff feed in this codebase includes). Same per-item read-state
 * mechanism as getStudentNotifications (NotificationRead, keyed by this item's id), so it slots
 * into DashboardShell's existing notifications prop as-is.
 */
export async function getCoordinatorNotifications(coordinatorId: string): Promise<NotificationItem[]> {
  const [resolvedCases, decidedLeaveRequests] = await Promise.all([
    prisma.disciplineCase.findMany({
      where: { reportedById: coordinatorId, status: "RESOLVED" },
      include: { student: true, resolvedBy: true },
      orderBy: { resolvedAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.staffLeaveRequest.findMany({
      where: { staffId: coordinatorId, status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { decidedAt: "desc" },
      take: FEED_LIMIT,
    }),
  ]);

  return [
    ...resolvedCases.map((disciplineCase) => ({
      id: `discipline-case-${disciplineCase.id}`,
      title: `Discipline case resolved — ${OUTCOME_LABELS[disciplineCase.outcome] ?? disciplineCase.outcome}`,
      detail: `${disciplineCase.student.firstName} ${disciplineCase.student.lastName}${
        disciplineCase.resolvedBy
          ? ` · by ${disciplineCase.resolvedBy.firstName} ${disciplineCase.resolvedBy.lastName}`
          : ""
      }`,
      date: disciplineCase.resolvedAt!,
      href: `/coordinator/students/${disciplineCase.studentId}`,
    })),
    ...decidedLeaveRequests.map((request) => ({
      id: `leave-request-${request.id}`,
      title: `Leave request ${request.status === "APPROVED" ? "approved" : "rejected"}`,
      detail: `${request.type} · ${request.startDate.toLocaleDateString()} – ${request.endDate.toLocaleDateString()}`,
      date: request.decidedAt!,
      href: "/staff/leave",
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, FEED_LIMIT);
}
