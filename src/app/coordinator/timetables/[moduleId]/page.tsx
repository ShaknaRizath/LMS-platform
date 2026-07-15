import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DetailSummary } from "@/components/admin/detail-summary";
import { TimetableCard } from "@/components/scheduling/timetable-card";

export default async function CoordinatorTimetableDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;

  const module_ = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      program: true,
      semester: true,
      lecturerAssignments: { include: { lecturer: true } },
      classSessions: { include: { lecturer: true }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
    },
  });

  if (!module_) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{module_.title}</h1>
        <p className="text-muted-foreground">{module_.code}</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <DetailSummary
            items={[
              { label: "Program", value: module_.program.name },
              { label: "Semester", value: module_.semester.name },
              {
                label: "Lecturers",
                value:
                  module_.lecturerAssignments
                    .map((a) => `${a.lecturer.firstName} ${a.lecturer.lastName}`)
                    .join(", ") || "Unassigned",
              },
            ]}
          />
        </CardContent>
      </Card>

      <TimetableCard
        moduleId={module_.id}
        sessions={module_.classSessions}
        lecturers={module_.lecturerAssignments.map((a) => a.lecturer)}
      />
    </div>
  );
}
