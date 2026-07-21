import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardHeaderCard } from "@/components/student/dashboard-header-card";
import { MiniCalendarCard } from "@/components/student/mini-calendar-card";
import { DistributionBarChart } from "@/components/analytics/distribution-bar-chart";
import { resolveRange, getAcademicPerformanceSummary, getGradeDistribution } from "@/lib/analytics/queries";
import { getModuleQualitySummary } from "@/lib/analytics/module-quality";
import { getLecturerWorkloads } from "@/lib/workload";
import { ACADEMIC_PALETTE } from "@/components/academic/palette";
import { ModuleQualityTable } from "@/components/academic/module-quality-table";
import { DisciplineCasePreview } from "@/components/academic/discipline-preview-card";
import { LecturerWorkloadCard } from "@/components/academic/lecturer-workload-card";

export default async function AcademicDirectorDashboardPage() {
  const range = resolveRange({});

  const [
    activePrograms,
    activeModules,
    activeLecturers,
    modulesMissingLecturer,
    openDisciplineCases,
    performanceSummary,
    gradeDistribution,
    moduleQuality,
    workloadRows,
    openCases,
    calendarEvents,
  ] = await Promise.all([
    prisma.program.count({ where: { isActive: true } }),
    prisma.module.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "LECTURER", isActive: true } }),
    prisma.module.count({ where: { isActive: true, lecturerAssignments: { none: {} } } }),
    prisma.disciplineCase.count({ where: { status: "OPEN" } }),
    getAcademicPerformanceSummary(range),
    getGradeDistribution(range),
    getModuleQualitySummary(),
    getLecturerWorkloads(),
    prisma.disciplineCase.findMany({
      where: { status: "OPEN" },
      include: { student: true, reportedBy: true },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    prisma.calendarEvent.findMany({ orderBy: { startDate: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeaderCard
        title="Academic Director"
        subtitle="Programs, curriculum standards, and quality assurance."
        palette={ACADEMIC_PALETTE}
        className="bg-gradient-to-br from-[#fdeef1] via-[#f6e2e7] to-[#efd9dd]"
        stats={[
          { label: "Active programs", value: activePrograms },
          { label: "Active modules", value: activeModules },
          { label: "Active lecturers", value: activeLecturers },
          { label: "Open discipline cases", value: openDisciplineCases },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Modules missing a lecturer"
          value={modulesMissingLecturer}
          hint="Active modules with no lecturer assigned"
        />
        <StatCard
          label="Average grade"
          value={performanceSummary.averageGrade !== null ? performanceSummary.averageGrade.toFixed(1) : "—"}
          hint="Last 30 days"
        />
        <StatCard
          label="Pass rate"
          value={performanceSummary.passRate !== null ? `${Math.round(performanceSummary.passRate)}%` : "—"}
          hint="Last 30 days"
        />
        <StatCard
          label="Average quiz score"
          value={performanceSummary.averageQuizScore !== null ? `${Math.round(performanceSummary.averageQuizScore)}%` : "—"}
          hint="Last 30 days"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Academic Performance Overview</CardTitle>
            <CardDescription>Grade distribution across graded submissions, last 30 days</CardDescription>
          </CardHeader>
          {gradeDistribution.some((bucket) => bucket.count > 0) ? (
            <DistributionBarChart data={gradeDistribution} xKey="bucket" color={ACADEMIC_PALETTE[3].accent} />
          ) : (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No graded submissions in this window yet.</p>
          )}
        </Card>
        <MiniCalendarCard
          events={calendarEvents}
          todayColor={ACADEMIC_PALETTE[3].accent}
          dotColor={ACADEMIC_PALETTE[0].accent}
          compact
          flatBackground
          monthTitleHeader
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ModuleQualityTable rows={moduleQuality.slice(0, 6)} />
        </div>
        <div className="flex flex-col gap-4">
          <DisciplineCasePreview
            items={openCases.map((disciplineCase) => ({
              id: disciplineCase.id,
              studentName: `${disciplineCase.student.firstName} ${disciplineCase.student.lastName}`,
              reportedByName: `${disciplineCase.reportedBy.firstName} ${disciplineCase.reportedBy.lastName}`,
              incidentDate: disciplineCase.incidentDate,
            }))}
          />
          <LecturerWorkloadCard rows={workloadRows.slice(0, 5)} />
        </div>
      </div>
    </div>
  );
}
