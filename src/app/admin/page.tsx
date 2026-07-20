import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { prisma } from "@/lib/db/prisma";
import { DashboardHeaderCard } from "@/components/student/dashboard-header-card";
import { MiniCalendarCard } from "@/components/student/mini-calendar-card";
import { NoticeBoardCard } from "@/components/student/notice-board-card";
import { ADMIN_PALETTE } from "@/components/admin/palette";
import { RecentNotificationsCard } from "@/components/admin/recent-notifications-card";
import { RecentAdmissionsCard } from "@/components/admin/recent-admissions-card";
import { RegistrationsOverTimeChart } from "@/components/admin/charts/registrations-over-time-chart";
import { RegistrationStatusChart } from "@/components/admin/charts/registration-status-chart";
import { PaymentStatusChart } from "@/components/admin/charts/payment-status-chart";

export default async function AdminDashboardPage() {
  const now = new Date();
  const oneWeekOut = new Date(now.getTime() + 7 * 86400000);
  const oneDayAgo = new Date(now.getTime() - 86400000);

  const [
    pendingRegistrations,
    activeModules,
    students,
    lecturers,
    activeSemester,
    registrationStatusCounts,
    paymentStatusCounts,
    verifiedPayments,
    assignmentsDue,
    recentNotificationCount,
    upcomingExams,
    pendingApplications,
    recentNotifications,
    recentAdmissions,
    announcements,
    calendarEvents,
  ] = await Promise.all([
    prisma.semesterRegistration.count({ where: { status: "PENDING" } }),
    prisma.module.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
    prisma.user.count({ where: { role: "LECTURER", isActive: true } }),
    prisma.semester.findFirst({ where: { status: "ACTIVE" } }),
    prisma.semesterRegistration.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.paymentRecord.groupBy({ by: ["verificationStatus"], _count: { _all: true } }),
    prisma.paymentRecord.findMany({
      where: { verificationStatus: "VERIFIED" },
      select: { amount: true },
    }),
    prisma.contentItem.count({
      where: { isAssignment: true, dueDate: { gte: now, lte: oneWeekOut } },
    }),
    prisma.notificationLog.count({ where: { sentAt: { gte: oneDayAgo } } }),
    prisma.quiz.count({ where: { kind: "EXAM", status: "SCHEDULED", availableFrom: { gte: now } } }),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.notificationLog.findMany({
      orderBy: { sentAt: "desc" },
      take: 5,
      select: { id: true, type: true, channel: true, recipient: true, status: true, sentAt: true },
    }),
    prisma.application.findMany({
      where: { status: { in: ["APPROVED", "REJECTED"] } },
      include: { program: true },
      orderBy: { reviewedAt: "desc" },
      take: 5,
    }),
    prisma.announcement.findMany({
      where: { scope: "INSTITUTION" },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      take: 4,
    }),
    prisma.calendarEvent.findMany({ orderBy: { startDate: "asc" } }),
  ]);

  const feeCollected = verifiedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const homeStats = [
    { label: "Pending registrations", value: pendingRegistrations },
    { label: "Assignments due", value: assignmentsDue, hint: "Due within 7 days" },
    { label: "Notifications", value: recentNotificationCount, hint: "Last 24 hours" },
    { label: "Pending admissions", value: pendingApplications },
  ];

  const windowStart = activeSemester?.registrationOpensAt ?? new Date(now.getTime() - 30 * 86400000);
  const windowEnd = activeSemester?.registrationClosesAt ?? now;

  const attendanceRecords = await prisma.attendanceRecord.findMany({
    where: { occurrenceDate: { gte: windowStart, lte: windowEnd } },
    select: { status: true },
  });
  const attendedCount = attendanceRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const attendanceRate =
    attendanceRecords.length > 0 ? `${Math.round((attendedCount / attendanceRecords.length) * 100)}%` : "—";

  const registrationsInWindow = await prisma.semesterRegistration.findMany({
    where: { createdAt: { gte: windowStart, lte: windowEnd } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const byDay = new Map<string, number>();
  for (const reg of registrationsInWindow) {
    const key = reg.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  const registrationsOverTime = Array.from(byDay.entries()).map(([date, count]) => ({ date, count }));

  const registrationStatusData = registrationStatusCounts.map((row) => ({
    status: row.status,
    count: row._count._all,
  }));
  const paymentStatusData = paymentStatusCounts.map((row) => ({
    status: row.verificationStatus,
    count: row._count._all,
  }));

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeaderCard
        title="Dashboard"
        subtitle="Overview of registrations, modules, and users."
        palette={ADMIN_PALETTE}
        className="bg-gradient-to-br from-[#eef1f8] via-[#f6f0e6] to-[#f2e9dd]"
        stats={[
          { label: "Students", value: students },
          { label: "Lecturers", value: lecturers },
          { label: "Active modules", value: activeModules },
          { label: "Fee collection", value: `LKR ${feeCollected.toLocaleString()}` },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {homeStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} />
        ))}
        <StatCard label="Upcoming exams" value={upcomingExams} />
        <StatCard label="Attendance rate" value={attendanceRate} hint="Active semester's registration window" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Registrations over time</CardTitle>
                <CardDescription>
                  {activeSemester ? `Within ${activeSemester.name}'s registration window` : "Last 30 days"}
                </CardDescription>
              </CardHeader>
              {registrationsOverTime.length > 0 ? (
                <RegistrationsOverTimeChart data={registrationsOverTime} color={ADMIN_PALETTE[0].accent} />
              ) : (
                <p className="px-6 pb-6 text-sm text-muted-foreground">No registrations in this window yet.</p>
              )}
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Payment verification</CardTitle>
                <CardDescription>All payment records</CardDescription>
              </CardHeader>
              {paymentStatusData.length > 0 ? (
                <PaymentStatusChart data={paymentStatusData} />
              ) : (
                <p className="px-6 pb-6 text-sm text-muted-foreground">No payments uploaded yet.</p>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <RecentNotificationsCard
              items={recentNotifications.map((item) => ({
                id: item.id,
                type: item.type,
                channel: item.channel,
                recipient: item.recipient,
                status: item.status,
                sentAt: item.sentAt,
              }))}
            />
            <RecentAdmissionsCard
              items={recentAdmissions.map((application) => ({
                id: application.id,
                applicantName: `${application.firstName} ${application.lastName}`,
                programName: application.program.name,
                status: application.status as "APPROVED" | "REJECTED",
                reviewedAt: application.reviewedAt!,
              }))}
            />
          </div>

          <NoticeBoardCard
            viewAllHref="/admin/announcements"
            palette={ADMIN_PALETTE}
            notices={announcements.map((notice) => ({
              id: notice.id,
              title: notice.title,
              publishedAt: notice.publishedAt,
              moduleCode: null,
            }))}
          />
        </div>

        <div className="flex flex-col gap-4">
          <MiniCalendarCard
            events={calendarEvents}
            todayColor={ADMIN_PALETTE[0].accent}
            dotColor={ADMIN_PALETTE[1].accent}
            compact
          />
          <Card>
            <CardHeader>
              <CardTitle>Registration status</CardTitle>
              <CardDescription>All semesters</CardDescription>
            </CardHeader>
            {registrationStatusData.length > 0 ? (
              <RegistrationStatusChart data={registrationStatusData} />
            ) : (
              <p className="px-6 pb-6 text-sm text-muted-foreground">No registrations yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
