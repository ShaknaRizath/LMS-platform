import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { CurriculumFeesCard } from "@/components/admin/curriculum-fees-card";

export default async function FinanceProgramFeesPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;

  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) notFound();

  const [distinctSemesterNumbers, existingFees] = await Promise.all([
    prisma.semester.findMany({ select: { semesterNumber: true }, distinct: ["semesterNumber"] }),
    prisma.programCurriculumFee.findMany({ where: { programId } }),
  ]);
  const semesterNumbers =
    distinctSemesterNumbers.length > 0
      ? distinctSemesterNumbers.map((s) => s.semesterNumber).sort((a, b) => a - b)
      : [1, 2];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{program.name}</h1>
        <p className="text-muted-foreground">{program.code}</p>
      </div>

      <CurriculumFeesCard
        programId={program.id}
        durationYears={program.durationYears}
        semesterNumbers={semesterNumbers}
        existingFees={existingFees}
      />
    </div>
  );
}
