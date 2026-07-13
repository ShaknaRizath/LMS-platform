import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { submitAttempt } from "@/lib/actions/student/quiz.actions";
import { QuizTakeForm } from "@/components/student/quiz-take-form";
import { Badge } from "@/components/ui/badge";

export default async function StudentQuizAttemptPage({
  params,
}: {
  params: Promise<{ moduleId: string; quizId: string; attemptId: string }>;
}) {
  const { moduleId, quizId, attemptId } = await params;
  const student = await requireRole(["STUDENT"]);

  const attempt = await prisma.quizAttempt.findUnique({
    where: { id: attemptId },
    include: {
      quiz: {
        include: {
          questions: {
            orderBy: { orderIndex: "asc" },
            include: { options: { orderBy: { orderIndex: "asc" } } },
          },
        },
      },
      answers: true,
    },
  });
  if (
    !attempt ||
    attempt.studentId !== student.id ||
    attempt.quizId !== quizId ||
    attempt.quiz.moduleId !== moduleId
  ) {
    notFound();
  }

  if (!attempt.submittedAt) {
    const deadline = attempt.quiz.timeLimitMinutes
      ? new Date(attempt.startedAt.getTime() + attempt.quiz.timeLimitMinutes * 60_000)
      : null;

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{attempt.quiz.title}</h1>
          <p className="text-muted-foreground">Attempt {attempt.attemptNumber}</p>
        </div>
        <QuizTakeForm
          action={submitAttempt.bind(null, attemptId)}
          questions={attempt.quiz.questions.map((question) => ({
            id: question.id,
            type: question.type,
            prompt: question.prompt,
            points: question.points,
            options: question.options,
          }))}
          deadline={deadline}
        />
      </div>
    );
  }

  const answerByQuestionId = new Map(attempt.answers.map((answer) => [answer.questionId, answer]));
  const hasUngradedEssay = attempt.quiz.questions.some(
    (question) => question.type === "ESSAY" && answerByQuestionId.get(question.id)?.pointsAwarded == null
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{attempt.quiz.title} — Results</h1>
        <p className="text-muted-foreground">
          Attempt {attempt.attemptNumber} ·{" "}
          {attempt.pointsEarned != null && attempt.totalPoints
            ? `${attempt.pointsEarned} / ${attempt.totalPoints} (${Math.round(
                (attempt.pointsEarned / attempt.totalPoints) * 100
              )}%)`
            : "—"}
          {hasUngradedEssay && " · essay answers still being graded"}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {attempt.quiz.questions.map((question, index) => {
          const answer = answerByQuestionId.get(question.id);
          return (
            <div key={question.id} className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm font-medium">
                {index + 1}. {question.prompt}
              </p>
              {question.type === "ESSAY" ? (
                <div className="mt-2 flex flex-col gap-2">
                  <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-2 text-sm">
                    {answer?.textResponse || "No answer submitted."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {answer?.pointsAwarded != null
                      ? `${answer.pointsAwarded} / ${question.points} pt${question.points === 1 ? "" : "s"} awarded`
                      : "Awaiting grading"}
                  </p>
                </div>
              ) : (
                <ul className="mt-2 flex flex-col gap-1">
                  {question.options.map((option) => {
                    const wasSelected = answer?.selectedOptionId === option.id;
                    return (
                      <li key={option.id} className="flex items-center gap-2 text-sm">
                        {option.isCorrect && <Badge>Correct</Badge>}
                        {wasSelected && (
                          <Badge variant={option.isCorrect ? "outline" : "destructive"}>Your answer</Badge>
                        )}
                        {option.text}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
