import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EssayGradeForm } from "@/components/lecturer/essay-grade-form";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { PenLine } from "lucide-react";

export default async function LecturerQuizResultsPage({
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

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId } });
  if (!quiz || quiz.moduleId !== moduleId) notFound();

  const [enrollments, attempts, essayAnswers] = await Promise.all([
    prisma.enrollment.findMany({
      where: { moduleId, status: "ACTIVE" },
      include: { student: true },
      orderBy: { student: { firstName: "asc" } },
    }),
    prisma.quizAttempt.findMany({ where: { quizId } }),
    prisma.quizAnswer.findMany({
      where: { question: { quizId, type: "ESSAY" }, attempt: { submittedAt: { not: null } } },
      include: { question: true, attempt: { include: { student: true } } },
      orderBy: { attempt: { submittedAt: "asc" } },
    }),
  ]);
  const ungradedEssayAnswers = essayAnswers.filter((answer) => answer.pointsAwarded == null);
  const gradedEssayAnswers = essayAnswers.filter((answer) => answer.pointsAwarded != null);

  const attemptsByStudentId = new Map<string, typeof attempts>();
  for (const attempt of attempts) {
    const list = attemptsByStudentId.get(attempt.studentId) ?? [];
    list.push(attempt);
    attemptsByStudentId.set(attempt.studentId, list);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{quiz.title} — Results</h1>
        <p className="text-muted-foreground">
          {attempts.filter((attempt) => attempt.submittedAt).length} submitted attempt(s)
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Attempts used</TableHead>
              <TableHead>Best score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enrollment) => {
              const studentAttempts = attemptsByStudentId.get(enrollment.studentId) ?? [];
              const submitted = studentAttempts.filter((attempt) => attempt.submittedAt);
              const best = submitted.reduce<{ pointsEarned: number; totalPoints: number } | null>(
                (acc, attempt) => {
                  if (attempt.pointsEarned == null || attempt.totalPoints == null || attempt.totalPoints === 0) {
                    return acc;
                  }
                  const pct = attempt.pointsEarned / attempt.totalPoints;
                  if (!acc || pct > acc.pointsEarned / acc.totalPoints) {
                    return { pointsEarned: attempt.pointsEarned, totalPoints: attempt.totalPoints };
                  }
                  return acc;
                },
                null
              );

              return (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    {enrollment.student.firstName} {enrollment.student.lastName}
                  </TableCell>
                  <TableCell>
                    {studentAttempts.length} / {quiz.maxAttempts}
                  </TableCell>
                  <TableCell>
                    {best
                      ? `${best.pointsEarned} / ${best.totalPoints} (${Math.round(
                          (best.pointsEarned / best.totalPoints) * 100
                        )}%)`
                      : "Not attempted"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {essayAnswers.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            Essay answers to grade {ungradedEssayAnswers.length > 0 && `(${ungradedEssayAnswers.length} pending)`}
          </h2>

          {ungradedEssayAnswers.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <PenLine />
                </EmptyMedia>
                <EmptyTitle>All essay answers graded</EmptyTitle>
                <EmptyDescription>Every submitted essay answer for this quiz has been scored.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="flex flex-col gap-3">
              {ungradedEssayAnswers.map((answer) => (
                <div key={answer.id} className="rounded-lg border border-border bg-card p-4">
                  <p className="text-sm font-medium">
                    {answer.attempt.student.firstName} {answer.attempt.student.lastName} — {answer.question.prompt}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap rounded-md bg-muted/50 p-2 text-sm">
                    {answer.textResponse || "No answer submitted."}
                  </p>
                  <div className="mt-2">
                    <EssayGradeForm
                      answerId={answer.id}
                      quizId={quizId}
                      maxPoints={answer.question.points}
                      currentPoints={answer.pointsAwarded}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {gradedEssayAnswers.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">Already graded</h3>
              {gradedEssayAnswers.map((answer) => (
                <div key={answer.id} className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm font-medium">
                    {answer.attempt.student.firstName} {answer.attempt.student.lastName} — {answer.question.prompt}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{answer.textResponse}</p>
                  <div className="mt-2">
                    <EssayGradeForm
                      answerId={answer.id}
                      quizId={quizId}
                      maxPoints={answer.question.points}
                      currentPoints={answer.pointsAwarded}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
