import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function CatalogSemesterPage({
  params,
}: {
  params: Promise<{ programId: string; yearLevel: string; semesterId: string }>;
}) {
  const { programId, yearLevel, semesterId } = await params;
  const yearLevelNum = Number(yearLevel);

  const semester = await prisma.semester.findUnique({
    where: { id: semesterId },
    include: { academicYear: true },
  });
  if (!semester || !Number.isInteger(yearLevelNum)) notFound();

  const modules = await prisma.module.findMany({
    where: { programId, semesterId, yearLevel: yearLevelNum, isActive: true },
    include: { lecturerAssignments: { include: { lecturer: true } } },
    orderBy: { code: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {semester.academicYear.name} — {semester.name}
        </h1>
        <p className="text-muted-foreground">Year {yearLevel} modules</p>
      </div>

      <div className="flex flex-col gap-3">
        {modules.length === 0 && (
          <p className="text-sm text-muted-foreground">No modules found for this year and semester.</p>
        )}
        {modules.map((module) => (
          <Card key={module.id}>
            <CardHeader>
              <CardDescription>{module.code}</CardDescription>
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>
                {module.credits ? `${module.credits} credits` : null}
                {module.lecturerAssignments.length > 0 && (
                  <>
                    {" · "}
                    {module.lecturerAssignments
                      .map((a) => `${a.lecturer.firstName} ${a.lecturer.lastName}`)
                      .join(", ")}
                  </>
                )}
              </CardDescription>
            </CardHeader>
            {module.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{module.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {semester.status === "ACTIVE" && (
        <Badge variant="secondary" className="w-fit">
          Registration open for this semester — go to Register to sign up
        </Badge>
      )}
    </div>
  );
}
