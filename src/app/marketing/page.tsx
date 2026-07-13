import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/shared/stat-card";

export default async function MarketingOfficerDashboardPage() {
  const totalStudents = await prisma.user.count({ where: { role: "STUDENT", isActive: true } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Marketing Officer</h1>
        <p className="text-muted-foreground">Prospective-student enquiries, applications, and recruitment.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enrolled students" value={totalStudents} hint="Current student base" />
        <StatCard label="Prospective enquiries" comingSoon />
        <StatCard label="Applications in review" comingSoon />
        <StatCard label="Conversion rate" comingSoon />
      </div>
    </div>
  );
}
