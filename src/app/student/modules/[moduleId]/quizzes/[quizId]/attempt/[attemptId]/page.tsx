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
            promptFileUrl: question.promptFileUrl,
            promptFileName: question.promptFileName,
            answerFormat: question.answerFormat,
          }))}
          deadline={deadline}
          studentId={student.id}
        />
      </div>
    );
  }

  if (!attempt.resultsPublishedAt) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{attempt.quiz.title}</h1>
          <p className="text-muted-foreground">Attempt {attempt.attemptNumber}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium">Submitted — awaiting grading</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your answers have been recorded. Your lecturer is still grading this attempt&apos;s questions —
            your score will appear here once they publish the results.
          </p>
        </div>
      </div>
    );
  }

  const answerByQuestionId = new Map(attempt.answers.map((answer) => [answer.questionId, answer]));

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
              {question.promptFileUrl && (
                <a
                  href={question.promptFileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex w-fit items-center gap-1.5 text-xs text-primary hover:underline"
                >
                  {question.promptFileName ?? "Attached file"}
                </a>
              )}
              {question.type === "ESSAY" ? (
                <div className="mt-2 flex flex-col gap-2">
                  {question.answerFormat === "FILE" ? (
                    answer?.fileUrl ? (
                      <a
                        href={answer.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-fit items-center gap-1.5 rounded-md bg-muted/50 p-2 text-sm text-primary hover:underline"
                      >
                        {answer.fileName ?? "Your uploaded file"}
                      </a>
                    ) : (
                      <p className="rounded-md bg-muted/50 p-2 text-sm text-muted-foreground">No file submitted.</p>
                    )
                  ) : (
                    <p className="whitespace-pre-wrap rounded-md bg-muted/50 p-2 text-sm">
                      {answer?.textResponse || "No answer submitted."}
                    </p>
                  )}
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
