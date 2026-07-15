import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { assertLecturerOwnsModule } from "@/lib/auth/ownership";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScorePracticalDialog } from "@/components/lecturer/score-practical-dialog";

export default async function ScorePracticalPage({
  params,
}: {
  params: Promise<{ moduleId: string; quizId: string }>;
}) {
  const { moduleId, quizId } = await params;
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { rubricCriteria: { orderBy: { orderIndex: "asc" } } },
  });
  if (!quiz || quiz.moduleId !== moduleId || quiz.kind !== "PRACTICAL") notFound();

  const [enrollments, attempts] = await Promise.all([
    prisma.enrollment.findMany({
      where: { moduleId, status: "ACTIVE" },
      include: { student: true },
      orderBy: { student: { firstName: "asc" } },
    }),
    prisma.quizAttempt.findMany({
      where: { quizId },
      include: { rubricScores: true },
    }),
  ]);

  const attemptByStudentId = new Map(attempts.map((attempt) => [attempt.studentId, attempt]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Score students</h1>
        <p className="text-muted-foreground">{quiz.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active students enrolled in this module yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {enrollments.map((enrollment) => {
                const attempt = attemptByStudentId.get(enrollment.studentId);
                const existingScores = Object.fromEntries(
                  (attempt?.rubricScores ?? []).map((score) => [score.criterionId, score.pointsAwarded])
                );
                const scored = attempt?.resultsPublishedAt != null;

                return (
                  <li
                    key={enrollment.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  >
                    <span className="text-sm">
                      {enrollment.student.firstName} {enrollment.student.lastName}
                      {scored && attempt?.pointsEarned != null && attempt.totalPoints != null && (
                        <span className="ml-2 text-muted-foreground">
                          {attempt.pointsEarned} / {attempt.totalPoints}
                        </span>
                      )}
                    </span>
                    <ScorePracticalDialog
                      quizId={quiz.id}
                      studentId={enrollment.studentId}
                      studentName={`${enrollment.student.firstName} ${enrollment.student.lastName}`}
                      criteria={quiz.rubricCriteria}
                      existingScores={existingScores}
                      triggerLabel={scored ? "Rescore" : "Score"}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
