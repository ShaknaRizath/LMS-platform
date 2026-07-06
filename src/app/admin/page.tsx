import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";

export default async function AdminDashboardPage() {
  const [pendingRegistrations, activeModules, students, lecturers] = await Promise.all([
    prisma.semesterRegistration.count({ where: { status: "PENDING" } }),
    prisma.module.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
    prisma.user.count({ where: { role: "LECTURER", isActive: true } }),
  ]);

  const stats = [
    { label: "Pending registrations", value: pendingRegistrations },
    { label: "Active modules", value: activeModules },
    { label: "Students", value: students },
    { label: "Lecturers", value: lecturers },
  ];

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
    </div>
  );
}
