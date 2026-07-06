import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

  const module_ = await prisma.module.findUnique({
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
  });
  if (!module_) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{module_.title}</h1>
        <p className="text-muted-foreground">{module_.code}</p>
      </div>

      {module_.weeks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No content has been published yet.</p>
      ) : (
        <Accordion defaultValue={module_.weeks.map((w) => w.id)} className="flex flex-col gap-3">
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
                  week.contentItems.map((item) => <ContentItemView key={item.id} item={item} />)
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
