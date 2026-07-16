import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { DisciplineCaseForm } from "@/components/coordinator/discipline-case-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function CoordinatorStudentDetailPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  await requireRole(["PROGRAM_COORDINATOR"]);

  const student = await prisma.user.findUnique({ where: { id: studentId }, include: { program: true } });
  if (!student || student.role !== "STUDENT") notFound();

  const cases = await prisma.disciplineCase.findMany({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {student.firstName} {student.lastName}
        </h1>
        <p className="text-muted-foreground">
          {student.email} {student.program ? `· ${student.program.name}` : ""}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>File a discipline case</CardTitle>
        </CardHeader>
        <CardContent>
          <DisciplineCaseForm studentId={studentId} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Discipline history</h2>
        {cases.length === 0 ? (
          <p className="text-sm text-muted-foreground">No discipline cases on file for this student.</p>
        ) : (
          cases.map((disciplineCase) => (
            <div key={disciplineCase.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium">
                  Incident on {disciplineCase.incidentDate.toLocaleDateString()}
                </p>
                <Badge variant={disciplineCase.status === "RESOLVED" ? "secondary" : "outline"}>
                  {disciplineCase.status === "RESOLVED" ? disciplineCase.outcome : "OPEN"}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{disciplineCase.description}</p>
              {disciplineCase.resolutionNote && (
                <p className="mt-1 text-xs text-muted-foreground">Resolution: {disciplineCase.resolutionNote}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
