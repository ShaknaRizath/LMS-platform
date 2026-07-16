import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { DisciplineResolutionActions } from "@/components/academic/discipline-resolution-actions";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { ShieldAlert } from "lucide-react";

export default async function AcademicDisciplinePage() {
  await requireRole(["ACADEMIC_DIRECTOR"]);

  const openCases = await prisma.disciplineCase.findMany({
    where: { status: "OPEN" },
    include: { student: true, reportedBy: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Discipline Cases</h1>
        <p className="text-muted-foreground">Open cases awaiting resolution, oldest first.</p>
      </div>

      {openCases.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldAlert />
            </EmptyMedia>
            <EmptyTitle>Nothing open</EmptyTitle>
            <EmptyDescription>Discipline cases filed by coordinators will appear here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {openCases.map((disciplineCase) => (
            <div key={disciplineCase.id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium">
                {disciplineCase.student.firstName} {disciplineCase.student.lastName} — incident on{" "}
                {disciplineCase.incidentDate.toLocaleDateString()}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{disciplineCase.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Filed by {disciplineCase.reportedBy.firstName} {disciplineCase.reportedBy.lastName}
              </p>
              <div className="mt-3">
                <DisciplineResolutionActions caseId={disciplineCase.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
