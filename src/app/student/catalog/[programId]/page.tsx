import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CatalogProgramPage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = await params;
  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program) notFound();

  const years = Array.from({ length: program.durationYears }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{program.name}</h1>
        <p className="text-muted-foreground">Select a year</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {years.map((year) => (
          <Link key={year} href={`/student/catalog/${program.id}/${year}`}>
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardTitle>Year {year}</CardTitle>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
