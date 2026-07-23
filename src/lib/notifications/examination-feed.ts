import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { NotificationItem } from "@/lib/notifications/student-feed";

const FEED_LIMIT = 8;

/**
 * In-app notification feed for the Examination Unit header bell — previously this role only
 * got getStaffLeaveNotifications (their own leave decisions), so lecturer-submitted exams and
 * exams with results awaiting review never surfaced in the bell even though both are real
 * Examination Unit action items (mirrors the dashboard's own "Awaiting scheduling" /
 * "Results Publishing Queue" sections, just as bell notifications).
 */
export async function getExaminationNotifications(userId: string): Promise<NotificationItem[]> {
  const [decidedLeaveRequests, examsAwaitingScheduling, pendingReviewAttempts] = await Promise.all([
    prisma.staffLeaveRequest.findMany({
      where: { staffId: userId, status: { in: ["APPROVED", "REJECTED"] } },
      orderBy: { decidedAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.quiz.findMany({
      where: { kind: "EXAM", status: "DRAFT", submittedForSchedulingAt: { not: null } },
      include: { module: true },
      orderBy: { submittedForSchedulingAt: "desc" },
      take: FEED_LIMIT,
    }),
    // Over-fetched and deduped per quiz below (rolled up per exam, not per attempt) — same
    // "closed exam with unpublished attempts" signal as getResultsPublishingQueue, just as a
    // flat query + in-memory group instead of the dashboard's fuller aggregation.
    prisma.quizAttempt.findMany({
      where: { submittedAt: { not: null }, resultsPublishedAt: null, quiz: { kind: "EXAM" } },
      include: { quiz: { include: { module: true } } },
      orderBy: { submittedAt: "desc" },
      take: FEED_LIMIT * 3,
    }),
  ]);

  const seenQuizIds = new Set<string>();
  const resultsAwaitingReview: NotificationItem[] = [];
  for (const attempt of pendingReviewAttempts) {
    if (seenQuizIds.has(attempt.quizId) || resultsAwaitingReview.length >= FEED_LIMIT) continue;
    seenQuizIds.add(attempt.quizId);
    resultsAwaitingReview.push({
      id: `exam-results-${attempt.quizId}`,
      title: "Exam results awaiting review",
      detail: `${attempt.quiz.title} · ${attempt.quiz.module.code}`,
      date: attempt.submittedAt!,
      href: `/examinations/exams/${attempt.quizId}/results`,
    });
  }

  return [
    ...decidedLeaveRequests.map((request) => ({
      id: `leave-request-${request.id}`,
      title: `Leave request ${request.status === "APPROVED" ? "approved" : "rejected"}`,
      detail: `${request.type} · ${request.startDate.toLocaleDateString()} – ${request.endDate.toLocaleDateString()}`,
      date: request.decidedAt!,
      href: "/staff/leave",
    })),
    ...examsAwaitingScheduling.map((quiz) => ({
      id: `exam-scheduling-${quiz.id}`,
      title: "Exam submitted for scheduling",
      detail: `${quiz.title} · ${quiz.module.code}`,
      date: quiz.submittedForSchedulingAt!,
      href: "/examinations/exams",
    })),
    ...resultsAwaitingReview,
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, FEED_LIMIT);
}
