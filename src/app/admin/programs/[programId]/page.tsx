import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProgramForm } from "@/components/admin/program-form";
import { DetailSummary } from "@/components/admin/detail-summary";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { CurriculumFeesCard } from "@/components/admin/curriculum-fees-card";
import { updateProgram, toggleProgramActive, deleteProgram } from "@/lib/actions/admin/program.actions";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      modules: {
        orderBy: [{ academicYear: { name: "desc" } }, { title: "asc" }],
        include: { academicYear: true, semester: true },
      },
    },
  });

  if (!program) notFound();

  const toggleAction = toggleProgramActive.bind(null, program.id, !program.isActive);

  const [studentCount, assignmentCount, enrollmentCount, registrationCount, distinctSemesterNumbers, existingFees] =
    await Promise.all([
      prisma.user.count({ where: { programId } }),
      prisma.lecturerModuleAssignment.count({ where: { module: { programId } } }),
      prisma.enrollment.count({ where: { module: { programId } } }),
      prisma.semesterRegistration.count({ where: { registrationModules: { some: { module: { programId } } } } }),
      prisma.semester.findMany({ select: { semesterNumber: true }, distinct: ["semesterNumber"] }),
      prisma.programCurriculumFee.findMany({ where: { programId } }),
    ]);
  const deleteWarning = `This permanently deletes ${program.modules.length} module(s), ${assignmentCount} lecturer assignment(s), ${enrollmentCount} enrollment(s), and ${registrationCount} registration(s) with their payment records. ${studentCount} student(s) will keep their accounts but lose their program assignment. This cannot be undone.`;
  const semesterNumbers =
    distinctSemesterNumbers.length > 0
      ? distinctSemesterNumbers.map((s) => s.semesterNumber).sort((a, b) => a - b)
      : [1, 2];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{program.name}</h1>
          <p className="text-muted-foreground">{program.code}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={program.isActive ? "secondary" : "outline"}>
            {program.isActive ? "Active" : "Inactive"}
          </Badge>
          <form action={toggleAction}>
            <Button type="submit" variant="outline">
              {program.isActive ? "Deactivate" : "Activate"}
            </Button>
          </form>
          <DeleteConfirmButton
            action={deleteProgram.bind(null, program.id)}
            title={`Delete ${program.name}?`}
            description={deleteWarning}
          />
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailSummary
            items={[
              { label: "Name", value: program.name },
              { label: "Code", value: program.code },
              { label: "Duration", value: `${program.durationYears} year(s)` },
              { label: "Description", value: program.description },
            ]}
          />
        </CardContent>
      </Card>

      <CurriculumFeesCard
        programId={program.id}
        durationYears={program.durationYears}
        semesterNumbers={semesterNumbers}
        existingFees={existingFees}
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Edit program</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgramForm
            action={updateProgram.bind(null, program.id)}
            defaultValues={program}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modules ({program.modules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {program.modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No modules yet under this program.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Year level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {program.modules.map((module) => (
                  <TableRow key={module.id}>
                    <TableCell>
                      <Link href={`/admin/modules/${module.id}`} className="font-medium hover:underline">
                        {module.code}
                      </Link>
                    </TableCell>
                    <TableCell>{module.title}</TableCell>
                    <TableCell>{module.academicYear.name}</TableCell>
                    <TableCell>{module.semester.name}</TableCell>
                    <TableCell>{module.yearLevel}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
