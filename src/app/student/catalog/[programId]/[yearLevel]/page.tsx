import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { CalendarRange } from "lucide-react";

export default async function CatalogYearPage({
  params,
}: {
  params: Promise<{ programId: string; yearLevel: string }>;
}) {
  const { programId, yearLevel } = await params;
  const yearLevelNum = Number(yearLevel);

  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program || !Number.isInteger(yearLevelNum)) notFound();

  const semesters = await prisma.semester.findMany({
    where: { modules: { some: { programId, yearLevel: yearLevelNum } } },
    orderBy: [{ academicYear: { name: "desc" } }, { semesterNumber: "asc" }],
    include: { academicYear: true },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {program.name} — Year {yearLevel}
        </h1>
        <p className="text-muted-foreground">Select a semester</p>
      </div>

      {semesters.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarRange />
            </EmptyMedia>
            <EmptyTitle>No semesters with modules yet</EmptyTitle>
            <EmptyDescription>Check back once modules are added for this year.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {semesters.map((semester) => (
            <Link key={semester.id} href={`/student/catalog/${programId}/${yearLevel}/${semester.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardDescription>{semester.academicYear.name}</CardDescription>
                  <CardTitle>{semester.name}</CardTitle>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
