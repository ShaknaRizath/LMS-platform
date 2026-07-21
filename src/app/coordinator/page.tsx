import { prisma } from "@/lib/db/prisma";
import { DashboardHeaderCard } from "@/components/student/dashboard-header-card";
import { MiniCalendarCard } from "@/components/student/mini-calendar-card";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";
import { TimetablePreviewCard } from "@/components/coordinator/timetable-preview-card";
import { ModuleAssignmentTable } from "@/components/coordinator/module-assignment-table";
import { StudentSupportCard } from "@/components/coordinator/student-support-card";
import { AnalyticsPreviewCard } from "@/components/coordinator/analytics-preview-card";
import { getUpcomingClassSessions } from "@/lib/scheduling/upcoming-sessions";
import { getModuleAssignmentStatus } from "@/lib/scheduling/module-assignment-status";
import { getDisciplineSupportSummary } from "@/lib/student-support";
import {
  resolveRange,
  getAcademicPerformanceSummary,
  getAttendanceSummary,
  getEngagementSummary,
  getModulesByAbsenteeism,
} from "@/lib/analytics/queries";

export default async function ProgramCoordinatorDashboardPage() {
  const range = resolveRange({});

  const [
    activeModules,
    unassignedModules,
    availableLecturers,
    activeSemester,
    upcomingSessions,
    moduleAssignmentRows,
    disciplineSummary,
    calendarEvents,
    performanceSummary,
    attendanceSummary,
    engagementSummary,
    modulesByAbsenteeism,
  ] = await Promise.all([
    prisma.module.count({ where: { isActive: true } }),
    prisma.module.count({ where: { isActive: true, lecturerAssignments: { none: {} } } }),
    prisma.user.count({ where: { role: "LECTURER", isActive: true } }),
    prisma.semester.findFirst({ where: { status: "ACTIVE" } }),
    getUpcomingClassSessions(5),
    getModuleAssignmentStatus(),
    getDisciplineSupportSummary(),
    prisma.calendarEvent.findMany({ orderBy: { startDate: "asc" } }),
    getAcademicPerformanceSummary(range),
    getAttendanceSummary(range),
    getEngagementSummary(range),
    getModulesByAbsenteeism(range),
  ]);

  const topAbsenteeModule = modulesByAbsenteeism[0]
    ? `${modulesByAbsenteeism[0].moduleCode} (${modulesByAbsenteeism[0].count})`
    : null;

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeaderCard
        title="Program Coordinator"
        subtitle="Modules, timetables, and lecturer assignments."
        palette={COORDINATOR_PALETTE}
        className="bg-gradient-to-br from-[#eef0fd] via-[#e9ecfb] to-[#e6e9f5]"
        stats={[
          { label: "Active modules", value: activeModules },
          { label: "Unassigned modules", value: unassignedModules },
          { label: "Available lecturers", value: availableLecturers },
          { label: "Active semester", value: activeSemester?.name ?? "—" },
        ]}
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ModuleAssignmentTable rows={moduleAssignmentRows.slice(0, 6)} />
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

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TimetablePreviewCard sessions={upcomingSessions} />
        </div>
        <StudentSupportCard summary={disciplineSummary} />
      </div>

      <AnalyticsPreviewCard
        stats={[
          {
            label: "Average grade",
            value: performanceSummary.averageGrade !== null ? performanceSummary.averageGrade.toFixed(1) : "—",
          },
          {
            label: "Pass rate",
            value: performanceSummary.passRate !== null ? `${Math.round(performanceSummary.passRate)}%` : "—",
          },
          {
            label: "Attendance rate",
            value: attendanceSummary.attendanceRate !== null ? `${Math.round(attendanceSummary.attendanceRate)}%` : "—",
          },
          {
            label: "Discussion activity",
            value: `${engagementSummary.threadCount + engagementSummary.postCount}`,
          },
        ]}
        topAbsenteeModule={topAbsenteeModule}
      />
    </div>
  );
}
