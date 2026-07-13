import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/shared/stat-card";

export default async function AcademicDirectorDashboardPage() {
  const [activePrograms, activeModules, activeLecturers, modulesMissingLecturer] = await Promise.all([
    prisma.program.count({ where: { isActive: true } }),
    prisma.module.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "LECTURER", isActive: true } }),
    prisma.module.count({ where: { isActive: true, lecturerAssignments: { none: {} } } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Academic Director</h1>
        <p className="text-muted-foreground">Programs, curriculum standards, and quality assurance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Active programs" value={activePrograms} />
        <StatCard label="Active modules" value={activeModules} />
        <StatCard label="Active lecturers" value={activeLecturers} />
        <StatCard
          label="Modules missing a lecturer"
          value={modulesMissingLecturer}
          hint="Active modules with no lecturer assigned"
        />
        <StatCard label="Curriculum quality reviews" comingSoon />
      </div>
    </div>
  );
}
