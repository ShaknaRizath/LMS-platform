import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { StatCard } from "@/components/shared/stat-card";
import { DashboardHeaderCard } from "@/components/student/dashboard-header-card";
import { MiniCalendarCard } from "@/components/student/mini-calendar-card";
import { ActivityCard, type ActivityItem } from "@/components/student/activity-card";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";
import { PendingLeaveTable, type PendingLeaveRow } from "@/components/hr/pending-leave-table";
import { StaffDirectoryPreview, type StaffDirectoryRow } from "@/components/hr/staff-directory-preview";
import { LeaveSummaryCard } from "@/components/hr/leave-summary-card";

export default async function HrOfficerDashboardPage() {
  const hrUser = await requireRole(["HR_OFFICER"]);
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    totalStaff,
    totalLecturers,
    inactiveAccounts,
    contractsExpiring,
    pendingLeaveRequests,
    staffDirectoryRows,
    leaveStatusCounts,
    calendarEvents,
    recentDecidedLeave,
    profile,
  ] = await Promise.all([
    prisma.user.count({ where: { role: { not: "STUDENT" }, isActive: true } }),
    prisma.user.count({ where: { role: "LECTURER", isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
    prisma.user.count({ where: { contractEndDate: { gte: now, lte: in30Days } } }),
    prisma.staffLeaveRequest.findMany({
      where: { status: "PENDING" },
      include: { staff: true },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    prisma.user.findMany({
      where: { role: { not: "STUDENT" } },
      orderBy: [{ role: "asc" }, { firstName: "asc" }],
      take: 5,
    }),
    prisma.staffLeaveRequest.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.calendarEvent.findMany({ orderBy: { startDate: "asc" } }),
    prisma.staffLeaveRequest.findMany({
      where: { decidedAt: { not: null } },
      include: { staff: true },
      orderBy: { decidedAt: "desc" },
      take: 5,
    }),
    prisma.user.findUnique({ where: { id: hrUser.id }, select: { avatarUrl: true } }),
  ]);

  const pendingLeaveRows: PendingLeaveRow[] = pendingLeaveRequests.map((request) => ({
    id: request.id,
    staffId: request.staffId,
    staffName: `${request.staff.firstName} ${request.staff.lastName}`,
    type: request.type,
    startDate: request.startDate,
    endDate: request.endDate,
  }));

  const staffRows: StaffDirectoryRow[] = staffDirectoryRows.map((member) => ({
    id: member.id,
    name: `${member.firstName} ${member.lastName}`,
    department: member.department,
    isActive: member.isActive,
  }));

  const leaveStatusData = leaveStatusCounts.map((row) => ({
    status: row.status,
    count: row._count._all,
  }));

  const activity: ActivityItem[] = recentDecidedLeave.map((request) => ({
    id: `leave-${request.id}`,
    label: `Leave ${request.status.toLowerCase()}`,
    detail: `${request.staff.firstName} ${request.staff.lastName} · ${request.type}`,
    date: request.decidedAt!,
    kind: "leave" as const,
  }));

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeaderCard
        title="HR Officer"
        subtitle="Lecturer and staff records, contracts, and payroll-related data."
        palette={COORDINATOR_PALETTE}
        className="bg-gradient-to-br from-[#eef0fd] via-[#e9ecfb] to-[#e6e9f5]"
        stats={[
          { label: "Total staff", value: totalStaff },
          { label: "Total lecturers", value: totalLecturers },
          { label: "Inactive accounts", value: inactiveAccounts },
          { label: "Contracts expiring", value: contractsExpiring },
        ]}
      />

      <div className="max-w-xs">
        <StatCard label="Payroll sync" comingSoon />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <PendingLeaveTable rows={pendingLeaveRows} />
        </div>
        <ActivityCard
          className="lg:row-span-2"
          userName={hrUser.name ?? hrUser.email ?? "HR Officer"}
          avatarUrl={profile?.avatarUrl}
          activity={activity}
          palette={COORDINATOR_PALETTE}
        />

        <div className="lg:col-span-2">
          <LeaveSummaryCard data={leaveStatusData} />
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

      <StaffDirectoryPreview rows={staffRows} />
    </div>
  );
}
