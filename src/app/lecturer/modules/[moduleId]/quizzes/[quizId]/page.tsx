import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuizMetaEditor } from "@/components/lecturer/quiz-meta-editor";
import { QuizStatusActions } from "@/components/lecturer/quiz-status-actions";
import { QuizQuestionList } from "@/components/lecturer/quiz-question-list";
import { QuizQuestionForm } from "@/components/lecturer/quiz-question-form";
import { addQuestion } from "@/lib/actions/lecturer/quiz.actions";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  CLOSED: "Closed",
};

export default async function LecturerQuizDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string; quizId: string }>;
}) {
  const { moduleId, quizId } = await params;
  const lecturer = await requireRole(["LECTURER"]);

  const assignment = await prisma.lecturerModuleAssignment.findUnique({
    where: { lecturerId_moduleId: { lecturerId: lecturer.id, moduleId } },
  });
  if (!assignment) notFound();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: { options: { orderBy: { orderIndex: "asc" } } },
      },
      scheduledBy: true,
      _count: { select: { attempts: true } },
    },
  });
  if (!quiz || quiz.moduleId !== moduleId) notFound();

  const isDraft = quiz.status === "DRAFT";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">{quiz.title}</h1>
            <Badge variant="outline">{quiz.kind === "EXAM" ? "Exam" : "Quiz"}</Badge>
            <Badge variant={quiz.status === "PUBLISHED" || quiz.status === "SCHEDULED" ? "default" : "secondary"}>
              {STATUS_LABELS[quiz.status]}
            </Badge>
            {isDraft && (
              <QuizMetaEditor
                quizId={quiz.id}
                defaultValues={{
                  title: quiz.title,
                  description: quiz.description,
                  timeLimitMinutes: quiz.timeLimitMinutes,
                  maxAttempts: quiz.maxAttempts,
                }}
              />
            )}
          </div>
          {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
          <p className="text-sm text-muted-foreground">
            {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min time limit` : "No time limit"} · Max{" "}
            {quiz.maxAttempts} attempt{quiz.maxAttempts === 1 ? "" : "s"}
          </p>
          {quiz.kind === "EXAM" && (
            <p className="text-sm text-muted-foreground">
              {quiz.status === "DRAFT" && quiz.submittedForSchedulingAt && "Awaiting Examination Unit scheduling."}
              {quiz.status === "DRAFT" && !quiz.submittedForSchedulingAt && "Not yet submitted for scheduling."}
              {quiz.status === "SCHEDULED" &&
                quiz.availableFrom &&
                quiz.availableUntil &&
                `Scheduled ${quiz.availableFrom.toLocaleString()} – ${quiz.availableUntil.toLocaleString()}${
                  quiz.scheduledBy ? ` by ${quiz.scheduledBy.firstName} ${quiz.scheduledBy.lastName}` : ""
                }`}
              {quiz.status === "CLOSED" && "Closed."}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" nativeButton={false} render={<Link href={`/lecturer/modules/${moduleId}/quizzes/${quizId}/results`} />}>
            <BarChart3 />
            Results ({quiz._count.attempts})
          </Button>
          <QuizStatusActions
            quizId={quiz.id}
            kind={quiz.kind}
            status={quiz.status}
            hasQuestions={quiz.questions.length > 0}
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Questions</h2>
        <QuizQuestionList questions={quiz.questions} quizId={quiz.id} canEdit={isDraft} />
        {isDraft && <QuizQuestionForm action={addQuestion.bind(null, quiz.id)} />}
      </div>
    </div>
  );
}
