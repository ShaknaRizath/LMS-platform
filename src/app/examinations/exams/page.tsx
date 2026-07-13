import { ClipboardList } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { scheduleExam } from "@/lib/actions/examinations/quiz.actions";
import { ScheduleExamForm } from "@/components/examinations/schedule-exam-form";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default async function ExaminationUnitExamsPage() {
  await requireRole(["EXAMINATION_UNIT"]);

  const [pending, scheduled] = await Promise.all([
    prisma.quiz.findMany({
      where: { kind: "EXAM", status: "DRAFT", submittedForSchedulingAt: { not: null } },
      include: { module: true, createdBy: true },
      orderBy: { submittedForSchedulingAt: "asc" },
    }),
    prisma.quiz.findMany({
      where: { kind: "EXAM", status: { in: ["SCHEDULED", "CLOSED"] } },
      include: { module: true },
      orderBy: { availableFrom: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Exams</h1>
        <p className="text-muted-foreground">Schedule lecturer-submitted exams and review what&apos;s live.</p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Awaiting scheduling</h2>
        {pending.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ClipboardList />
              </EmptyMedia>
              <EmptyTitle>Nothing pending</EmptyTitle>
              <EmptyDescription>Exams submitted by lecturers for scheduling will appear here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((quiz) => (
              <div key={quiz.id} className="rounded-xl border border-border bg-card p-4">
                <p className="font-medium">{quiz.title}</p>
                <p className="text-sm text-muted-foreground">
                  {quiz.module.code} — {quiz.module.title} · Submitted by {quiz.createdBy.firstName}{" "}
                  {quiz.createdBy.lastName}
                </p>
                <div className="mt-3">
                  <ScheduleExamForm quizId={quiz.id} action={scheduleExam.bind(null, quiz.id)} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Scheduled &amp; closed</h2>
        {scheduled.length === 0 ? (
          <p className="text-sm text-muted-foreground">No exams scheduled yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {scheduled.map((quiz) => (
              <div
                key={quiz.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <div>
                  <p className="text-sm font-medium">{quiz.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {quiz.module.code} — {quiz.module.title} ·{" "}
                    {quiz.availableFrom?.toLocaleString()} – {quiz.availableUntil?.toLocaleString()}
                  </p>
                </div>
                <Badge variant={quiz.status === "SCHEDULED" ? "default" : "secondary"}>
                  {quiz.status === "SCHEDULED" ? "Scheduled" : "Closed"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
