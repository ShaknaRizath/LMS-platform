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
 * In-app notification feed for a Program Coordinator's header bell — right now just
 * discipline cases they filed that the Academic Director has since resolved. Same
 * per-item read-state mechanism as getStudentNotifications (NotificationRead, keyed by
 * this item's id), so it slots into DashboardShell's existing notifications prop as-is.
 */
export async function getCoordinatorNotifications(coordinatorId: string): Promise<NotificationItem[]> {
  const resolvedCases = await prisma.disciplineCase.findMany({
    where: { reportedById: coordinatorId, status: "RESOLVED" },
    include: { student: true, resolvedBy: true },
    orderBy: { resolvedAt: "desc" },
    take: FEED_LIMIT,
  });

  return resolvedCases.map((disciplineCase) => ({
    id: `discipline-case-${disciplineCase.id}`,
    title: `Discipline case resolved — ${OUTCOME_LABELS[disciplineCase.outcome] ?? disciplineCase.outcome}`,
    detail: `${disciplineCase.student.firstName} ${disciplineCase.student.lastName}${
      disciplineCase.resolvedBy
        ? ` · by ${disciplineCase.resolvedBy.firstName} ${disciplineCase.resolvedBy.lastName}`
        : ""
    }`,
    date: disciplineCase.resolvedAt!,
    href: `/coordinator/students/${disciplineCase.studentId}`,
  }));
}
