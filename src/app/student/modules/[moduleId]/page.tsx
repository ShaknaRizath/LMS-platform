import Link from "next/link";
import { notFound } from "next/navigation";
import { MessagesSquare, ListChecks } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ContentItemView } from "@/components/student/content-item-view";

export default async function StudentModuleContentPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const student = await requireRole(["STUDENT"]);

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_moduleId: { studentId: student.id, moduleId } },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") notFound();

  const [module_, submissions] = await Promise.all([
    prisma.module.findUnique({
      where: { id: moduleId },
      include: {
        weeks: {
          orderBy: { orderIndex: "asc" },
          include: {
            contentItems: {
              where: { status: "PUBLISHED" },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    }),
    prisma.submission.findMany({
      where: { studentId: student.id, contentItem: { week: { moduleId } } },
    }),
  ]);
  if (!module_) notFound();

  const submissionByContentItemId = new Map(submissions.map((submission) => [submission.contentItemId, submission]));

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
            render={<Link href={`/student/modules/${moduleId}/quizzes`} />}
          >
            <ListChecks />
            Exams
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`/student/modules/${moduleId}/discussions`} />}
          >
            <MessagesSquare />
            Discussions
          </Button>
        </div>
      </div>

      {module_.weeks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No content has been published yet.</p>
      ) : (
        <Accordion
          key={module_.weeks.map((w) => w.id).join(",")}
          defaultValue={module_.weeks.map((w) => w.id)}
          className="flex flex-col gap-3"
        >
          {module_.weeks.map((week) => (
            <AccordionItem key={week.id} value={week.id} className="rounded-xl border border-border bg-card px-4">
              <AccordionTrigger className="text-base font-medium">
                Week {week.weekNumber}
                {week.title ? ` — ${week.title}` : ""}
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-2 pb-4">
                {week.contentItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No content published for this week yet.</p>
                ) : (
                  week.contentItems.map((item) => {
                    const submission = submissionByContentItemId.get(item.id);
                    return (
                      <ContentItemView
                        key={item.id}
                        item={item}
                        moduleId={moduleId}
                        submissionStatus={
                          !submission ? "NOT_SUBMITTED" : submission.gradedAt ? "GRADED" : "SUBMITTED"
                        }
                        grade={submission?.grade ? Number(submission.grade) : null}
                      />
                    );
                  })
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
