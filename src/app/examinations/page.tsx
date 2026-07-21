import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardHeaderCard } from "@/components/student/dashboard-header-card";
import { MiniCalendarCard } from "@/components/student/mini-calendar-card";
import { ActivityCard, type ActivityItem } from "@/components/student/activity-card";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";
import { UpcomingExamsCard, type UpcomingExamItem } from "@/components/examinations/upcoming-exams-card";
import { ResultsPublishingQueueCard } from "@/components/examinations/results-publishing-queue-card";
import { MarksLockingStatusCard } from "@/components/examinations/marks-locking-status-card";
import { DocumentIssueTrendCard } from "@/components/examinations/document-issue-trend-card";
import { resolveRange } from "@/lib/analytics/queries";
import {
  getResultsPublishingQueue,
  getMarksLockingSummary,
  getDocumentIssueTrend,
} from "@/lib/examinations/dashboard";

export default async function ExaminationUnitDashboardPage() {
  const examinationUser = await requireRole(["EXAMINATION_UNIT"]);
  const range = resolveRange({});

  const activeEnrollments = await prisma.enrollment.count({ where: { status: "ACTIVE" } });
  const ungradedSubmissions = await prisma.submission.count({ where: { gradedAt: null } });
  const activeSemester = await prisma.semester.findFirst({ where: { status: "ACTIVE" } });
  const scheduledExams = await prisma.quiz.count({ where: { kind: "EXAM", status: "SCHEDULED" } });
  const transcriptsIssued = await prisma.transcript.count();

  const [
    upcomingExamRows,
    resultsQueue,
    marksLockingSummary,
    documentTrend,
    calendarEvents,
    recentScheduledExams,
    recentPublishedQuizzes,
    recentCertificates,
    recentTranscripts,
    profile,
  ] = await Promise.all([
    prisma.quiz.findMany({
      where: { kind: "EXAM", status: "SCHEDULED", availableUntil: { gte: new Date() } },
      include: { module: true, invigilator: true },
      orderBy: { availableFrom: "asc" },
      take: 5,
    }),
    getResultsPublishingQueue(),
    getMarksLockingSummary(),
    getDocumentIssueTrend(range),
    prisma.calendarEvent.findMany({ orderBy: { startDate: "asc" } }),
    prisma.quiz.findMany({
      where: { kind: "EXAM", scheduledById: { not: null } },
      include: { module: true },
      orderBy: { updatedAt: "desc" },
      take: 3,
    }),
    prisma.quizAttempt.groupBy({
      by: ["quizId"],
      where: { resultsPublishedAt: { not: null } },
      _max: { resultsPublishedAt: true },
      orderBy: { _max: { resultsPublishedAt: "desc" } },
      take: 3,
    }),
    prisma.certificate.findMany({
      include: { student: true, module: true },
      orderBy: { issuedAt: "desc" },
      take: 3,
    }),
    prisma.transcript.findMany({
      include: { student: true },
      orderBy: { issuedAt: "desc" },
      take: 3,
    }),
    prisma.user.findUnique({ where: { id: examinationUser.id }, select: { avatarUrl: true } }),
  ]);

  const publishedQuizzes = await prisma.quiz.findMany({
    where: { id: { in: recentPublishedQuizzes.map((row) => row.quizId) } },
    include: { module: true },
  });
  const publishedQuizById = new Map(publishedQuizzes.map((quiz) => [quiz.id, quiz]));

  const upcomingExams: UpcomingExamItem[] = upcomingExamRows.map((quiz) => {
    const from = quiz.availableFrom;
    const until = quiz.availableUntil;
    const sameDay = from && until && from.toDateString() === until.toDateString();
    const dateLabel = from
      ? sameDay
        ? from.toLocaleDateString(undefined, { month: "short", day: "numeric" })
        : `${from.toLocaleDateString(undefined, { month: "short", day: "numeric" })}–${until?.toLocaleDateString(undefined, { day: "numeric" }) ?? ""}`
      : "Date TBD";
    return {
      id: quiz.id,
      title: quiz.title,
      moduleCode: quiz.module.code,
      dateLabel,
      venue: quiz.venue,
      invigilatorName: quiz.invigilator ? `${quiz.invigilator.firstName} ${quiz.invigilator.lastName}` : null,
    };
  });

  const activity: ActivityItem[] = [
    ...recentScheduledExams.map((quiz) => ({
      id: `exam-${quiz.id}`,
      label: `Exam scheduled`,
      detail: `${quiz.title} · ${quiz.module.code}`,
      date: quiz.updatedAt,
      kind: "exam" as const,
    })),
    ...recentPublishedQuizzes.flatMap((row) => {
      const quiz = publishedQuizById.get(row.quizId);
      if (!quiz || !row._max.resultsPublishedAt) return [];
      return [
        {
          id: `result-${row.quizId}`,
          label: `Results published`,
          detail: `${quiz.title} · ${quiz.module.code}`,
          date: row._max.resultsPublishedAt,
          kind: "result" as const,
        },
      ];
    }),
    ...recentCertificates.map((certificate) => ({
      id: `certificate-${certificate.id}`,
      label: `Certificate issued`,
      detail: `${certificate.student.firstName} ${certificate.student.lastName} · ${certificate.module.code}`,
      date: certificate.issuedAt,
      kind: "certificate" as const,
    })),
    ...recentTranscripts.map((transcript) => ({
      id: `transcript-${transcript.id}`,
      label: `Transcript issued`,
      detail: `${transcript.student.firstName} ${transcript.student.lastName}`,
      date: transcript.issuedAt,
      kind: "transcript" as const,
    })),
    ...marksLockingSummary.recent.map((row) => ({
      id: `lock-${row.moduleId}-${row.date.getTime()}`,
      label: row.locked ? "Marks locked" : "Marks unlocked",
      detail: `${row.moduleCode} — ${row.moduleTitle}`,
      date: row.date,
      kind: "lock" as const,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 6);

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeaderCard
        title="Examination Unit"
        subtitle="Exams, results, marks locking, and academic records."
        palette={COORDINATOR_PALETTE}
        className="bg-gradient-to-br from-[#eef0fd] via-[#e9ecfb] to-[#e6e9f5]"
        stats={[
          { label: "Active enrollments", value: activeEnrollments },
          { label: "Ungraded submissions", value: ungradedSubmissions },
          { label: "Active semester", value: activeSemester?.name ?? "—" },
          { label: "Scheduled exams", value: scheduledExams },
          { label: "Transcripts issued", value: transcriptsIssued },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <UpcomingExamsCard exams={upcomingExams} />
        </div>
        <ActivityCard
          className="lg:row-span-2"
          userName={examinationUser.name ?? examinationUser.email ?? "Examination Unit"}
          avatarUrl={profile?.avatarUrl}
          activity={activity}
          palette={COORDINATOR_PALETTE}
        />

        <div className="lg:col-span-2">
          <ResultsPublishingQueueCard rows={resultsQueue} />
        </div>
        <div className="lg:col-span-1">
          <MarksLockingStatusCard summary={marksLockingSummary} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DocumentIssueTrendCard data={documentTrend} />
        </div>
        <MiniCalendarCard
          events={calendarEvents}
          todayColor={COORDINATOR_PALETTE[0].accent}
          dotColor={COORDINATOR_PALETTE[2].accent}
          compact
          flatBackground
          monthTitleHeader
        />
      </div>
    </div>
  );
}
