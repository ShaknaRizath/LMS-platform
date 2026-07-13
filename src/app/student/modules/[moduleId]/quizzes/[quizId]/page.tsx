import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { startAttempt } from "@/lib/actions/student/quiz.actions";
import { Button } from "@/components/ui/button";
import { StartAttemptForm } from "@/components/student/start-attempt-form";

export default async function StudentQuizDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string; quizId: string }>;
}) {
  const { moduleId, quizId } = await params;
  const student = await requireRole(["STUDENT"]);

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_moduleId: { studentId: student.id, moduleId } },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") notFound();

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { attempts: { where: { studentId: student.id }, orderBy: { attemptNumber: "asc" } } },
  });
  if (!quiz || quiz.moduleId !== moduleId || quiz.status === "DRAFT") notFound();

  const now = new Date();
  const withinWindow =
    quiz.status === "PUBLISHED" ||
    (quiz.status === "SCHEDULED" &&
      (!quiz.availableFrom || quiz.availableFrom <= now) &&
      (!quiz.availableUntil || quiz.availableUntil >= now));

  const inProgress = quiz.attempts.find((attempt) => !attempt.submittedAt);
  const submitted = quiz.attempts.filter((attempt) => attempt.submittedAt);
  const attemptsRemaining = Math.max(0, quiz.maxAttempts - quiz.attempts.length);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{quiz.title}</h1>
        {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
        <p className="text-sm text-muted-foreground">
          {quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min time limit` : "No time limit"} · {attemptsRemaining}{" "}
          attempt{attemptsRemaining === 1 ? "" : "s"} remaining
        </p>
        {quiz.kind === "EXAM" && quiz.status === "SCHEDULED" && quiz.availableFrom && quiz.availableUntil && (
          <p className="text-sm text-muted-foreground">
            Available {quiz.availableFrom.toLocaleString()} – {quiz.availableUntil.toLocaleString()}
          </p>
        )}
      </div>

      {submitted.length > 0 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-foreground">Past attempts</h2>
          {submitted.map((attempt) => (
            <Link
              key={attempt.id}
              href={`/student/modules/${moduleId}/quizzes/${quizId}/attempt/${attempt.id}`}
              className="rounded-lg border border-border bg-card p-3 text-sm hover:bg-muted/40"
            >
              Attempt {attempt.attemptNumber}:{" "}
              {attempt.pointsEarned != null && attempt.totalPoints
                ? `${attempt.pointsEarned} / ${attempt.totalPoints} (${Math.round(
                    (attempt.pointsEarned / attempt.totalPoints) * 100
                  )}%)`
                : "—"}
            </Link>
          ))}
        </div>
      )}

      {inProgress ? (
        <Button nativeButton={false} className="w-fit" render={<Link href={`/student/modules/${moduleId}/quizzes/${quizId}/attempt/${inProgress.id}`} />}>
          Continue attempt
        </Button>
      ) : withinWindow && attemptsRemaining > 0 ? (
        <StartAttemptForm
          action={startAttempt.bind(null, quizId)}
          label={submitted.length > 0 ? "Start new attempt" : "Start attempt"}
        />
      ) : quiz.status === "SCHEDULED" && !withinWindow ? (
        <p className="text-sm text-muted-foreground">This exam is not open yet.</p>
      ) : attemptsRemaining === 0 ? (
        <p className="text-sm text-muted-foreground">You have used all your attempts.</p>
      ) : (
        <p className="text-sm text-muted-foreground">This is closed.</p>
      )}
    </div>
  );
}
