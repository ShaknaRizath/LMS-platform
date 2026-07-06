import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";

export default async function LecturerDashboardPage() {
  const lecturer = await requireRole(["LECTURER"]);

  const [moduleCount, enrolledStudents, draftContentItems] = await Promise.all([
    prisma.lecturerModuleAssignment.count({ where: { lecturerId: lecturer.id } }),
    prisma.enrollment.count({
      where: { status: "ACTIVE", module: { lecturerAssignments: { some: { lecturerId: lecturer.id } } } },
    }),
    prisma.contentItem.count({
      where: {
        status: "DRAFT",
        week: { module: { lecturerAssignments: { some: { lecturerId: lecturer.id } } } },
      },
    }),
  ]);

  const stats = [
    { label: "My modules", value: moduleCount },
    { label: "Enrolled students", value: enrolledStudents },
    { label: "Draft content items", value: draftContentItems },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Your modules and recent announcements.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
