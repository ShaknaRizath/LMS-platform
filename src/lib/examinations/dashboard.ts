import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { DateRange } from "@/lib/analytics/queries";

export type ResultsQueueRow = {
  quizId: string;
  title: string;
  moduleCode: string;
  totalStudents: number;
  publishedCount: number;
  pendingReviewCount: number;
  notAttemptedCount: number;
};

// Exams whose window has closed (or that were explicitly closed) are candidates for
// publishing — same "attempted vs. not" distinction as the per-exam results page
// (src/app/examinations/exams/[quizId]/results/page.tsx), just rolled up per exam
// instead of per student. Two batch queries (enrollment counts, submitted attempts)
// keep this at a fixed query count regardless of how many exams are in the queue —
// same discipline as loadFeeMap/loadScholarshipMap in src/lib/finance/reports.ts.
export async function getResultsPublishingQueue(): Promise<ResultsQueueRow[]> {
  const now = new Date();
  const quizzes = await prisma.quiz.findMany({
    where: {
      kind: "EXAM",
      status: { in: ["SCHEDULED", "CLOSED"] },
      OR: [{ status: "CLOSED" }, { availableUntil: { lte: now } }],
    },
    include: { module: true },
    orderBy: { availableUntil: "desc" },
    take: 5,
  });
  if (quizzes.length === 0) return [];

  const quizIds = quizzes.map((quiz) => quiz.id);
  const moduleIds = [...new Set(quizzes.map((quiz) => quiz.moduleId))];

  const [enrollmentCounts, attempts] = await Promise.all([
    prisma.enrollment.groupBy({
      by: ["moduleId"],
      where: { moduleId: { in: moduleIds }, status: "ACTIVE" },
      _count: { _all: true },
    }),
    prisma.quizAttempt.findMany({
      where: { quizId: { in: quizIds }, submittedAt: { not: null } },
      select: { quizId: true, studentId: true, resultsPublishedAt: true },
    }),
  ]);

  const enrolledByModuleId = new Map(enrollmentCounts.map((row) => [row.moduleId, row._count._all]));

  return quizzes.map((quiz) => {
    const quizAttempts = attempts.filter((attempt) => attempt.quizId === quiz.id);
    const publishedStudents = new Set<string>();
    const submittedStudents = new Set<string>();
    for (const attempt of quizAttempts) {
      submittedStudents.add(attempt.studentId);
      if (attempt.resultsPublishedAt) publishedStudents.add(attempt.studentId);
    }
    const totalStudents = enrolledByModuleId.get(quiz.moduleId) ?? 0;

    return {
      quizId: quiz.id,
      title: quiz.title,
      moduleCode: quiz.module.code,
      totalStudents,
      publishedCount: publishedStudents.size,
      pendingReviewCount: submittedStudents.size - publishedStudents.size,
      notAttemptedCount: Math.max(totalStudents - submittedStudents.size, 0),
    };
  });
}

export type RecentLockRow = {
  moduleId: string;
  moduleCode: string;
  moduleTitle: string;
  locked: boolean;
  actorName: string;
  date: Date;
};

export type MarksLockingSummary = {
  totalActive: number;
  lockedCount: number;
  openCount: number;
  recent: RecentLockRow[];
};

export async function getMarksLockingSummary(): Promise<MarksLockingSummary> {
  const [totalActive, lockedCount, recentLocks] = await Promise.all([
    prisma.module.count({ where: { isActive: true } }),
    prisma.moduleGradeLock.count({ where: { unlockedAt: null, module: { isActive: true } } }),
    prisma.moduleGradeLock.findMany({
      include: { module: true, lockedBy: true, unlockedBy: true },
      orderBy: { lockedAt: "desc" },
      take: 4,
    }),
  ]);

  const recent: RecentLockRow[] = recentLocks.map((row) => {
    const locked = row.unlockedAt === null;
    const actor = locked ? row.lockedBy : (row.unlockedBy ?? row.lockedBy);
    return {
      moduleId: row.moduleId,
      moduleCode: row.module.code,
      moduleTitle: row.module.title,
      locked,
      actorName: `${actor.firstName} ${actor.lastName}`,
      date: locked ? row.lockedAt : row.unlockedAt!,
    };
  });

  return {
    totalActive,
    lockedCount,
    openCount: Math.max(totalActive - lockedCount, 0),
    recent,
  };
}

export type DocumentIssueTrendPoint = { date: string; certificates: number; transcripts: number };

export async function getDocumentIssueTrend(range: DateRange): Promise<DocumentIssueTrendPoint[]> {
  const [certificates, transcripts] = await Promise.all([
    prisma.certificate.findMany({
      where: { issuedAt: { gte: range.from, lte: range.to } },
      select: { issuedAt: true },
    }),
    prisma.transcript.findMany({
      where: { issuedAt: { gte: range.from, lte: range.to } },
      select: { issuedAt: true },
    }),
  ]);

  const byDay = new Map<string, { sortKey: number; certificates: number; transcripts: number }>();
  const dayKey = (date: Date) => date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  for (const certificate of certificates) {
    const key = dayKey(certificate.issuedAt);
    const entry = byDay.get(key) ?? { sortKey: dayStart(certificate.issuedAt), certificates: 0, transcripts: 0 };
    entry.certificates += 1;
    byDay.set(key, entry);
  }
  for (const transcript of transcripts) {
    const key = dayKey(transcript.issuedAt);
    const entry = byDay.get(key) ?? { sortKey: dayStart(transcript.issuedAt), certificates: 0, transcripts: 0 };
    entry.transcripts += 1;
    byDay.set(key, entry);
  }

  return Array.from(byDay.entries())
    .sort((a, b) => a[1].sortKey - b[1].sortKey)
    .map(([date, { certificates, transcripts }]) => ({ date, certificates, transcripts }));
}
