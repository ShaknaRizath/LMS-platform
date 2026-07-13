import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/shared/stat-card";

export default async function HrOfficerDashboardPage() {
  const [totalStaff, totalLecturers, inactiveAccounts] = await Promise.all([
    prisma.user.count({ where: { role: { not: "STUDENT" }, isActive: true } }),
    prisma.user.count({ where: { role: "LECTURER", isActive: true } }),
    prisma.user.count({ where: { isActive: false } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">HR Officer</h1>
        <p className="text-muted-foreground">Lecturer and staff records, contracts, and payroll-related data.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total staff" value={totalStaff} hint="Active non-student accounts" />
        <StatCard label="Total lecturers" value={totalLecturers} />
        <StatCard label="Inactive accounts" value={inactiveAccounts} />
        <StatCard label="Contracts expiring" comingSoon />
        <StatCard label="Payroll sync" comingSoon />
      </div>
    </div>
  );
}
