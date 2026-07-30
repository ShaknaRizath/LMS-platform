import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { NotificationItem } from "@/lib/notifications/student-feed";

const FEED_LIMIT = 8;

const QUIZ_KIND_LABEL: Record<string, string> = {
  QUIZ: "Quiz",
  EXAM: "Exam",
};

/**
 * In-app notification feed for the Lecturer header bell — the staff member's own leave
 * request decisions (HR approving/rejecting a request they filed), new ungraded assignment
 * submissions, and new quiz/exam attempts waiting on them. Deliberately excludes PRACTICAL:
 * that kind has no independent student-submission event — the lecturer creates the
 * QuizAttempt themselves at grading time (scorePracticalAttempt), so including it here would
 * notify a lecturer about their own action. Same per-item read-state mechanism as
 * getStudentNotifications (NotificationRead, keyed by this item's id).
 */
export async function getLecturerNotifications(lecturerId: string): Promise<NotificationItem[]> {
  const [decidedLeaveRequests, ungradedSubmissions, quizAttempts] = await Promise.all([
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
    prisma.quizAttempt.findMany({
      where: {
        submittedAt: { not: null },
        quiz: { kind: { in: ["QUIZ", "EXAM"] }, module: { lecturerAssignments: { some: { lecturerId } } } },
      },
      include: { quiz: { include: { module: true } }, student: true },
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
    ...quizAttempts.map((attempt) => ({
      id: `quiz-attempt-${attempt.id}`,
      title: `${QUIZ_KIND_LABEL[attempt.quiz.kind] ?? "Assessment"} submitted — "${attempt.quiz.title}"`,
      detail: `${attempt.quiz.module.code} · ${attempt.student.firstName} ${attempt.student.lastName}`,
      date: attempt.submittedAt!,
      href: `/lecturer/modules/${attempt.quiz.moduleId}/quizzes/${attempt.quiz.id}/results`,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, FEED_LIMIT);

  return items;
}
