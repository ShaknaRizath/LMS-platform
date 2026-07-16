import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getOutstandingBalances, collectionRateFromRows } from "@/lib/finance/reports";

export type DateRange = { from: Date; to: Date };

function defaultFrom(): Date {
  return new Date(Date.now() - 30 * 86400000);
}

export function resolveRange(searchParams: { from?: string; to?: string }): DateRange {
  const from = searchParams.from ? new Date(searchParams.from) : defaultFrom();
  const to = searchParams.to ? new Date(searchParams.to) : new Date();
  // Inclusive of the whole "to" day, not just midnight.
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

function dayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ---------- Academic performance ----------

export async function getAcademicPerformanceSummary(range: DateRange) {
  const [submissions, attempts] = await Promise.all([
    prisma.submission.findMany({
      where: { grade: { not: null }, gradedAt: { gte: range.from, lte: range.to } },
      select: { grade: true },
    }),
    prisma.quizAttempt.findMany({
      where: {
        submittedAt: { gte: range.from, lte: range.to },
        pointsEarned: { not: null },
        totalPoints: { not: null, gt: 0 },
      },
      select: { pointsEarned: true, totalPoints: true },
    }),
  ]);

  const grades = submissions.map((submission) => Number(submission.grade));
  const averageGrade = grades.length ? grades.reduce((sum, grade) => sum + grade, 0) / grades.length : null;
  const passRate = grades.length ? (grades.filter((grade) => grade >= 50).length / grades.length) * 100 : null;

  const quizScores = attempts.map((attempt) => (attempt.pointsEarned! / attempt.totalPoints!) * 100);
  const averageQuizScore = quizScores.length
    ? quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length
    : null;

  return { averageGrade, passRate, averageQuizScore };
}

const GRADE_BUCKETS = [
  { bucket: "0-49", min: 0, max: 49 },
  { bucket: "50-59", min: 50, max: 59 },
  { bucket: "60-69", min: 60, max: 69 },
  { bucket: "70-79", min: 70, max: 79 },
  { bucket: "80-89", min: 80, max: 89 },
  { bucket: "90-100", min: 90, max: 100 },
];

export async function getGradeDistribution(range: DateRange) {
  const submissions = await prisma.submission.findMany({
    where: { grade: { not: null }, gradedAt: { gte: range.from, lte: range.to } },
    select: { grade: true },
  });
  const grades = submissions.map((submission) => Number(submission.grade));

  return GRADE_BUCKETS.map(({ bucket, min, max }) => ({
    bucket,
    count: grades.filter((grade) => grade >= min && grade <= max).length,
  }));
}

export async function getQuizScoreTrend(range: DateRange) {
  const attempts = await prisma.quizAttempt.findMany({
    where: {
      submittedAt: { gte: range.from, lte: range.to },
      pointsEarned: { not: null },
      totalPoints: { not: null, gt: 0 },
    },
    select: { submittedAt: true, pointsEarned: true, totalPoints: true },
    orderBy: { submittedAt: "asc" },
  });

  const byDay = new Map<string, number[]>();
  for (const attempt of attempts) {
    const key = dayLabel(attempt.submittedAt!);
    const scores = byDay.get(key) ?? [];
    scores.push((attempt.pointsEarned! / attempt.totalPoints!) * 100);
    byDay.set(key, scores);
  }

  return Array.from(byDay.entries()).map(([date, scores]) => ({
    date,
    averageScore: Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length),
  }));
}

// ---------- Engagement ----------

export async function getEngagementSummary(range: DateRange) {
  const [threadCount, postCount] = await Promise.all([
    prisma.discussionThread.count({ where: { createdAt: { gte: range.from, lte: range.to } } }),
    prisma.discussionPost.count({ where: { createdAt: { gte: range.from, lte: range.to } } }),
  ]);
  return { threadCount, postCount };
}

export async function getDiscussionActivity(range: DateRange) {
  const [threads, posts] = await Promise.all([
    prisma.discussionThread.findMany({
      where: { createdAt: { gte: range.from, lte: range.to } },
      select: { createdAt: true },
    }),
    prisma.discussionPost.findMany({
      where: { createdAt: { gte: range.from, lte: range.to } },
      select: { createdAt: true },
    }),
  ]);

  // Merge both event streams and sort chronologically before bucketing, so day-keys
  // land in the Map in true date order (bucketing each list separately and
  // concatenating would let a thread-only day and a post-only day interleave out of
  // order, since Map preserves first-insertion order, not key order).
  const events = [
    ...threads.map((thread) => ({ createdAt: thread.createdAt, kind: "threads" as const })),
    ...posts.map((post) => ({ createdAt: post.createdAt, kind: "posts" as const })),
  ].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  const byDay = new Map<string, { threads: number; posts: number }>();
  for (const event of events) {
    const key = dayLabel(event.createdAt);
    const entry = byDay.get(key) ?? { threads: 0, posts: 0 };
    entry[event.kind] += 1;
    byDay.set(key, entry);
  }

  return Array.from(byDay.entries()).map(([date, counts]) => ({ date, ...counts }));
}

export async function getTopModulesByDiscussionActivity(range: DateRange) {
  const posts = await prisma.discussionPost.findMany({
    where: { createdAt: { gte: range.from, lte: range.to } },
    select: { thread: { select: { moduleId: true } } },
  });

  const countByModuleId = new Map<string, number>();
  for (const post of posts) {
    // Institution-wide (non-module-scoped) forum posts have no module to attribute to.
    if (!post.thread.moduleId) continue;
    countByModuleId.set(post.thread.moduleId, (countByModuleId.get(post.thread.moduleId) ?? 0) + 1);
  }
  if (countByModuleId.size === 0) return [];

  const modules = await prisma.module.findMany({
    where: { id: { in: Array.from(countByModuleId.keys()) } },
    select: { id: true, code: true, title: true },
  });
  const moduleById = new Map(modules.map((module_) => [module_.id, module_]));

  return Array.from(countByModuleId.entries())
    .map(([moduleId, count]) => ({
      moduleCode: moduleById.get(moduleId)?.code ?? "—",
      moduleTitle: moduleById.get(moduleId)?.title ?? "—",
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// ---------- Attendance ----------

export async function getAttendanceSummary(range: DateRange) {
  const records = await prisma.attendanceRecord.findMany({
    where: { occurrenceDate: { gte: range.from, lte: range.to } },
    select: { status: true },
  });
  const total = records.length;
  const attended = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const attendanceRate = total > 0 ? (attended / total) * 100 : null;
  return { total, attendanceRate };
}

export async function getAttendanceTrend(range: DateRange) {
  const records = await prisma.attendanceRecord.findMany({
    where: { occurrenceDate: { gte: range.from, lte: range.to } },
    select: { occurrenceDate: true, status: true },
    orderBy: { occurrenceDate: "asc" },
  });

  const byDay = new Map<string, { total: number; attended: number }>();
  for (const record of records) {
    const key = dayLabel(record.occurrenceDate);
    const entry = byDay.get(key) ?? { total: 0, attended: 0 };
    entry.total += 1;
    if (record.status === "PRESENT" || record.status === "LATE") entry.attended += 1;
    byDay.set(key, entry);
  }

  return Array.from(byDay.entries()).map(([date, { total, attended }]) => ({
    date,
    attendanceRate: Math.round((attended / total) * 100),
  }));
}

export async function getModulesByAbsenteeism(range: DateRange) {
  const records = await prisma.attendanceRecord.findMany({
    where: { occurrenceDate: { gte: range.from, lte: range.to }, status: "ABSENT" },
    select: { classSession: { select: { moduleId: true } } },
  });

  const countByModuleId = new Map<string, number>();
  for (const record of records) {
    const moduleId = record.classSession.moduleId;
    countByModuleId.set(moduleId, (countByModuleId.get(moduleId) ?? 0) + 1);
  }
  if (countByModuleId.size === 0) return [];

  const modules = await prisma.module.findMany({
    where: { id: { in: Array.from(countByModuleId.keys()) } },
    select: { id: true, code: true, title: true },
  });
  const moduleById = new Map(modules.map((module_) => [module_.id, module_]));

  return Array.from(countByModuleId.entries())
    .map(([moduleId, count]) => ({
      moduleCode: moduleById.get(moduleId)?.code ?? "—",
      moduleTitle: moduleById.get(moduleId)?.title ?? "—",
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// ---------- Communication delivery ----------

export async function getCommunicationSummary(range: DateRange) {
  const [totalSent, delivered] = await Promise.all([
    prisma.notificationLog.count({ where: { sentAt: { gte: range.from, lte: range.to } } }),
    // STUBBED counts as "delivered" for this stat — every channel is stub-backed
    // today (see the Communication Module), so treating only SENT as success would
    // show 0% forever in dev even though the pipeline is working correctly.
    prisma.notificationLog.count({
      where: { sentAt: { gte: range.from, lte: range.to }, status: { in: ["SENT", "STUBBED"] } },
    }),
  ]);
  const successRate = totalSent > 0 ? (delivered / totalSent) * 100 : null;
  return { totalSent, successRate };
}

export async function getNotificationVolume(range: DateRange) {
  const logs = await prisma.notificationLog.findMany({
    where: { sentAt: { gte: range.from, lte: range.to } },
    select: { sentAt: true, channel: true },
    orderBy: { sentAt: "asc" },
  });

  const byDay = new Map<string, { email: number; sms: number; whatsapp: number }>();
  for (const log of logs) {
    const key = dayLabel(log.sentAt);
    const entry = byDay.get(key) ?? { email: 0, sms: 0, whatsapp: 0 };
    if (log.channel === "EMAIL") entry.email += 1;
    else if (log.channel === "SMS") entry.sms += 1;
    else entry.whatsapp += 1;
    byDay.set(key, entry);
  }

  return Array.from(byDay.entries()).map(([date, counts]) => ({ date, ...counts }));
}

export async function getNotificationStatusBreakdown(range: DateRange) {
  const rows = await prisma.notificationLog.groupBy({
    by: ["status"],
    where: { sentAt: { gte: range.from, lte: range.to } },
    _count: { _all: true },
  });
  return rows.map((row) => ({ status: row.status, count: row._count._all }));
}

// ---------- Certificates & completion ----------

export async function getCertificatesTotal(range: DateRange) {
  return prisma.certificate.count({ where: { issuedAt: { gte: range.from, lte: range.to } } });
}

export async function getCertificatesOverTime(range: DateRange) {
  const certificates = await prisma.certificate.findMany({
    where: { issuedAt: { gte: range.from, lte: range.to } },
    select: { issuedAt: true },
    orderBy: { issuedAt: "asc" },
  });

  const byDay = new Map<string, number>();
  for (const certificate of certificates) {
    const key = dayLabel(certificate.issuedAt);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  return Array.from(byDay.entries()).map(([date, count]) => ({ date, count }));
}

export async function getTopModulesByCertificates(range: DateRange) {
  const rows = await prisma.certificate.groupBy({
    by: ["moduleId"],
    where: { issuedAt: { gte: range.from, lte: range.to } },
    _count: { _all: true },
  });
  if (rows.length === 0) return [];

  const modules = await prisma.module.findMany({
    where: { id: { in: rows.map((row) => row.moduleId) } },
    select: { id: true, code: true, title: true },
  });
  const moduleById = new Map(modules.map((module_) => [module_.id, module_]));

  return rows
    .map((row) => ({
      moduleCode: moduleById.get(row.moduleId)?.code ?? "—",
      moduleTitle: moduleById.get(row.moduleId)?.title ?? "—",
      count: row._count._all,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// ---------- Finance ----------

// Collection rate and outstanding balance are current-state snapshots (which registrations
// still owe money right now), not something that meaningfully buckets by date range the way
// the other sections do — a semester's fee isn't "collected per day." range is accepted for a
// consistent call signature with every other getXSummary function but intentionally unused.
export async function getFinanceSummary(_range: DateRange) {
  const { rows, totalOutstanding } = await getOutstandingBalances();
  const { rate } = collectionRateFromRows(rows);
  return { collectionRate: rate, totalOutstanding };
}
