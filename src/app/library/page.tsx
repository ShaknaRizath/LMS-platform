import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/shared/stat-card";

export default async function LibraryOfficerDashboardPage() {
  const totalStudents = await prisma.user.count({ where: { role: "STUDENT", isActive: true } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Library Officer</h1>
        <p className="text-muted-foreground">Library resources, digital collections, and borrowing records.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Potential borrowers" value={totalStudents} hint="Active students" />
        <StatCard label="Catalogue size" comingSoon />
        <StatCard label="Active loans" comingSoon />
        <StatCard label="Overdue items" comingSoon />
      </div>
    </div>
  );
}
