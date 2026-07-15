import Link from "next/link";
import { notFound } from "next/navigation";
import { BarChart3, Users } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuizMetaEditor } from "@/components/lecturer/quiz-meta-editor";
import { QuizStatusActions } from "@/components/lecturer/quiz-status-actions";
import { QuizQuestionList } from "@/components/lecturer/quiz-question-list";
import { QuizQuestionForm } from "@/components/lecturer/quiz-question-form";
import { RubricCriteriaManager } from "@/components/lecturer/rubric-criteria-manager";
import { QuizOutcomesForm } from "@/components/lecturer/quiz-outcomes-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { addQuestion } from "@/lib/actions/lecturer/quiz.actions";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  CLOSED: "Closed",
};

const KIND_LABELS: Record<string, string> = {
  QUIZ: "Quiz",
  EXAM: "Exam",
  PRACTICAL: "Practical",
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

  const [quiz, categories, moduleOutcomes] = await Promise.all([
    prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          include: { options: { orderBy: { orderIndex: "asc" } } },
        },
        rubricCriteria: { orderBy: { orderIndex: "asc" } },
        scheduledBy: true,
        learningOutcomes: true,
        _count: { select: { attempts: true } },
      },
    }),
    prisma.assessmentCategory.findMany({ where: { moduleId }, orderBy: { name: "asc" } }),
    prisma.learningOutcome.findMany({ where: { moduleId }, orderBy: { code: "asc" } }),
  ]);
  if (!quiz || quiz.moduleId !== moduleId) notFound();

  const isDraft = quiz.status === "DRAFT";
  const isPractical = quiz.kind === "PRACTICAL";
  const canPublish = isPractical ? quiz.rubricCriteria.length > 0 : quiz.questions.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">{quiz.title}</h1>
            <Badge variant="outline">{KIND_LABELS[quiz.kind]}</Badge>
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
                  assessmentCategoryId: quiz.assessmentCategoryId,
                }}
                categories={categories}
              />
            )}
          </div>
          {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
          <p className="text-sm text-muted-foreground">
            {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min time limit` : "No time limit"} · Max{" "}
            {quiz.maxAttempts} attempt{quiz.maxAttempts === 1 ? "" : "s"}
          </p>
          {quiz.learningOutcomes.length > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {quiz.learningOutcomes.map((outcome) => (
                <Badge key={outcome.id} variant="secondary">
                  {outcome.code}
                </Badge>
              ))}
            </div>
          )}
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
          {isPractical && !isDraft && (
            <Button variant="outline" nativeButton={false} render={<Link href={`/lecturer/modules/${moduleId}/quizzes/${quizId}/score`} />}>
              <Users />
              Score students
            </Button>
          )}
          <Button variant="outline" nativeButton={false} render={<Link href={`/lecturer/modules/${moduleId}/quizzes/${quizId}/results`} />}>
            <BarChart3 />
            Results ({quiz._count.attempts})
          </Button>
          <QuizStatusActions
            quizId={quiz.id}
            kind={quiz.kind}
            status={quiz.status}
            canPublish={canPublish}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning outcomes</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizOutcomesForm
            quizId={quiz.id}
            moduleId={moduleId}
            outcomes={moduleOutcomes}
            taggedOutcomeIds={quiz.learningOutcomes.map((o) => o.id)}
          />
        </CardContent>
      </Card>

      {isPractical ? (
        <RubricCriteriaManager quizId={quiz.id} criteria={quiz.rubricCriteria} canEdit={isDraft} />
      ) : (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">Questions</h2>
          <QuizQuestionList questions={quiz.questions} quizId={quiz.id} canEdit={isDraft} />
          {isDraft && <QuizQuestionForm action={addQuestion.bind(null, quiz.id)} />}
        </div>
      )}
    </div>
  );
}
