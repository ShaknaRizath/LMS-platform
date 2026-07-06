import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModuleForm } from "@/components/admin/module-form";
import { AssignLecturerForm } from "@/components/admin/assign-lecturer-form";
import { updateModule, unassignLecturer } from "@/lib/actions/admin/module.actions";

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;

  const [module_, programs, semesters, lecturers] = await Promise.all([
    prisma.module.findUnique({
      where: { id: moduleId },
      include: { lecturerAssignments: { include: { lecturer: true } } },
    }),
    prisma.program.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.semester.findMany({
      orderBy: [{ academicYear: { name: "desc" } }, { semesterNumber: "asc" }],
      include: { academicYear: true },
    }),
    prisma.user.findMany({ where: { role: "LECTURER", isActive: true }, orderBy: { firstName: "asc" } }),
  ]);

  if (!module_) notFound();

  const options = {
    programs,
    semesters: semesters.map((s) => ({ id: s.id, name: s.name, academicYearName: s.academicYear.name })),
  };

  const assignedIds = new Set(module_.lecturerAssignments.map((a) => a.lecturerId));
  const availableLecturers = lecturers.filter((l) => !assignedIds.has(l.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{module_.title}</h1>
        <p className="text-muted-foreground">{module_.code}</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Edit module</CardTitle>
        </CardHeader>
        <CardContent>
          <ModuleForm
            action={updateModule.bind(null, module_.id)}
            options={options}
            defaultValues={module_}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lecturers</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {module_.lecturerAssignments.length > 0 && (
            <ul className="flex flex-col gap-2">
              {module_.lecturerAssignments.map((assignment) => (
                <li
                  key={assignment.id}
                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                >
                  <span className="text-sm">
                    {assignment.lecturer.firstName} {assignment.lecturer.lastName}
                  </span>
                  <form action={unassignLecturer.bind(null, module_.id, assignment.lecturerId)}>
                    <Button type="submit" variant="ghost" size="sm">
                      Remove
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          {availableLecturers.length > 0 ? (
            <AssignLecturerForm moduleId={module_.id} lecturers={availableLecturers} />
          ) : (
            module_.lecturerAssignments.length === 0 && (
              <p className="text-sm text-muted-foreground">No lecturer accounts available to assign.</p>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}
