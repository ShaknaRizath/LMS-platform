import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function CatalogPage() {
  const programs = await prisma.program.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Catalog</h1>
        <p className="text-muted-foreground">Browse programs, years, semesters, and modules.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <Link key={program.id} href={`/student/catalog/${program.id}`}>
            <Card className="h-full transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardDescription>{program.code}</CardDescription>
                <CardTitle>{program.name}</CardTitle>
                <CardDescription>{program.durationYears} years</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
