import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { ModuleForm } from "@/components/admin/module-form";
import { createModule } from "@/lib/actions/admin/module.actions";

export default async function NewModulePage() {
  const [programs, semesters] = await Promise.all([
    prisma.program.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.semester.findMany({
      orderBy: [{ academicYear: { name: "desc" } }, { semesterNumber: "asc" }],
      include: { academicYear: true },
    }),
  ]);

  const options = {
    programs,
    semesters: semesters.map((s) => ({ id: s.id, name: s.name, academicYearName: s.academicYear.name })),
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">New module</h1>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Module details</CardTitle>
        </CardHeader>
        <CardContent>
          <ModuleForm action={createModule} options={options} submitLabel="Create module" />
        </CardContent>
      </Card>
    </div>
  );
}
