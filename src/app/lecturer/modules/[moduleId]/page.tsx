import Link from "next/link";
import { notFound } from "next/navigation";
import { Users, Megaphone, ClipboardList, MessagesSquare, ListChecks } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { WeekPanel } from "@/components/lecturer/week-panel";
import { AddWeekForm } from "@/components/lecturer/add-week-form";
import { createWeek } from "@/lib/actions/lecturer/week.actions";

export default async function LecturerModuleDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const lecturer = await requireRole(["LECTURER"]);

  const assignment = await prisma.lecturerModuleAssignment.findUnique({
    where: { lecturerId_moduleId: { lecturerId: lecturer.id, moduleId } },
  });
  if (!assignment) notFound();

  const [module_, categories] = await Promise.all([
    prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        weeks: {
          orderBy: { orderIndex: "asc" },
          include: { contentItems: { orderBy: { orderIndex: "asc" } } },
        },
      },
    }),
    prisma.assessmentCategory.findMany({ where: { moduleId }, orderBy: { name: "asc" } }),
  ]);
  if (!module_) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{module_.title}</h1>
          <p className="text-muted-foreground">{module_.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/lecturer/modules/${module_.id}/students`} />}
          >
            <Users />
            Students
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/lecturer/modules/${module_.id}/assignments`} />}
          >
            <ClipboardList />
            Assignments
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/lecturer/modules/${module_.id}/quizzes`} />}
          >
            <ListChecks />
            Exams
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/lecturer/modules/${module_.id}/discussions`} />}
          >
            <MessagesSquare />
            Discussions
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/lecturer/modules/${module_.id}/announcements`} />}
          >
            <Megaphone />
            Announcements
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {module_.weeks.length > 0 && (
          <Accordion
            key={module_.weeks.map((week) => week.id).join(",")}
            defaultValue={module_.weeks.map((week) => week.id)}
            className="flex flex-col gap-3"
          >
            {module_.weeks.map((week) => (
              <WeekPanel key={week.id} week={week} moduleId={module_.id} categories={categories} />
            ))}
          </Accordion>
        )}

        <AddWeekForm action={createWeek.bind(null, module_.id)} />
      </div>
    </div>
  );
}
