import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/shared/stat-card";

export default async function ProgramCoordinatorDashboardPage() {
  const [activeModules, unassignedModules, availableLecturers, activeSemester] = await Promise.all([
    prisma.module.count({ where: { isActive: true } }),
    prisma.module.count({ where: { isActive: true, lecturerAssignments: { none: {} } } }),
    prisma.user.count({ where: { role: "LECTURER", isActive: true } }),
    prisma.semester.findFirst({ where: { status: "ACTIVE" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Program Coordinator</h1>
        <p className="text-muted-foreground">Modules, timetables, and lecturer assignments.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active modules" value={activeModules} />
        <StatCard label="Unassigned modules" value={unassignedModules} />
        <StatCard label="Available lecturers" value={availableLecturers} />
        <StatCard label="Active semester" value={activeSemester?.name ?? "—"} />
      </div>
    </div>
  );
}
