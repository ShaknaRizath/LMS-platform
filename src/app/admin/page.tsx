import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { prisma } from "@/lib/db/prisma";
import { RegistrationsOverTimeChart } from "@/components/admin/charts/registrations-over-time-chart";
import { RegistrationStatusChart } from "@/components/admin/charts/registration-status-chart";
import { PaymentStatusChart } from "@/components/admin/charts/payment-status-chart";

function defaultWindowStart(): Date {
  return new Date(Date.now() - 30 * 86400000);
}

export default async function AdminDashboardPage() {
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
    recentNotifications,
    upcomingExams,
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
      where: {
        isAssignment: true,
        dueDate: { gte: new Date(), lte: new Date(Date.now() + 7 * 86400000) },
      },
    }),
    prisma.notificationLog.count({
      where: { sentAt: { gte: new Date(Date.now() - 86400000) } },
    }),
    prisma.quiz.count({ where: { kind: "EXAM", status: "SCHEDULED", availableFrom: { gte: new Date() } } }),
  ]);

  const stats = [
    { label: "Pending registrations", value: pendingRegistrations },
    { label: "Active modules", value: activeModules },
    { label: "Students", value: students },
    { label: "Lecturers", value: lecturers },
  ];

  const feeCollected = verifiedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  const homeStats = [
    { label: "Fee collection", value: `LKR ${feeCollected.toLocaleString()}` },
    { label: "Assignments due", value: assignmentsDue, hint: "Due within 7 days" },
    { label: "Notifications", value: recentNotifications, hint: "Last 24 hours" },
  ];

  const windowStart = activeSemester?.registrationOpensAt ?? defaultWindowStart();
  const windowEnd = activeSemester?.registrationClosesAt ?? new Date();

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
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of registrations, modules, and users.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {homeStats.map((stat) => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} hint={stat.hint} />
        ))}
        <StatCard label="Online students" comingSoon />
        <StatCard label="Upcoming exams" value={upcomingExams} />
        <StatCard label="Attendance statistics" comingSoon />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Registrations over time</CardTitle>
            <CardDescription>
              {activeSemester ? `Within ${activeSemester.name}'s registration window` : "Last 30 days"}
            </CardDescription>
          </CardHeader>
          {registrationsOverTime.length > 0 ? (
            <RegistrationsOverTimeChart data={registrationsOverTime} />
          ) : (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No registrations in this window yet.</p>
          )}
        </Card>
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
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
    </div>
  );
}
