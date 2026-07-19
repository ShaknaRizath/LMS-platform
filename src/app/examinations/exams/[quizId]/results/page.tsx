import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { publishExamResults } from "@/lib/actions/examinations/quiz.actions";
import { PublishSelectedResultsForm } from "@/components/examinations/publish-selected-results-form";

export default async function ExaminationUnitExamResultsPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  await requireRole(["EXAMINATION_UNIT"]);
  const { quizId } = await params;

  const quiz = await prisma.quiz.findUnique({ where: { id: quizId }, include: { module: true } });
  if (!quiz || quiz.kind !== "EXAM") notFound();

  const [enrollments, attempts, ungradedEssayCounts] = await Promise.all([
    prisma.enrollment.findMany({
      where: { moduleId: quiz.moduleId, status: "ACTIVE" },
      include: { student: true },
      orderBy: { student: { firstName: "asc" } },
    }),
    prisma.quizAttempt.findMany({ where: { quizId } }),
    prisma.quizAnswer.groupBy({
      by: ["attemptId"],
      where: { attempt: { quizId }, pointsAwarded: null, question: { type: "ESSAY" } },
      _count: { _all: true },
    }),
  ]);

  const ungradedCountByAttemptId = new Map(ungradedEssayCounts.map((row) => [row.attemptId, row._count._all]));

  const attemptsByStudentId = new Map<string, typeof attempts>();
  for (const attempt of attempts) {
    const list = attemptsByStudentId.get(attempt.studentId) ?? [];
    list.push(attempt);
    attemptsByStudentId.set(attempt.studentId, list);
  }

  const rows = enrollments.map((enrollment) => {
    const studentAttempts = attemptsByStudentId.get(enrollment.studentId) ?? [];
    const submitted = studentAttempts.filter((attempt) => attempt.submittedAt);

    const best = submitted.reduce<
      { attemptId: string; pointsEarned: number; totalPoints: number; published: boolean } | null
    >((acc, attempt) => {
      if (attempt.pointsEarned == null || attempt.totalPoints == null || attempt.totalPoints === 0) {
        return acc;
      }
      const pct = attempt.pointsEarned / attempt.totalPoints;
      if (!acc || pct > acc.pointsEarned / acc.totalPoints) {
        return {
          attemptId: attempt.id,
          pointsEarned: attempt.pointsEarned,
          totalPoints: attempt.totalPoints,
          published: attempt.resultsPublishedAt != null,
        };
      }
      return acc;
    }, null);

    return {
      studentId: enrollment.studentId,
      name: `${enrollment.student.firstName} ${enrollment.student.lastName}`,
      attemptsUsed: studentAttempts.length,
      best,
      pendingEssayCount: best ? (ungradedCountByAttemptId.get(best.attemptId) ?? 0) : 0,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{quiz.title} — Publish results</h1>
        <p className="text-muted-foreground">
          {quiz.module.code} — {quiz.module.title}. Review who sat the exam and what they scored, then choose
          which results to release.
        </p>
      </div>

      <PublishSelectedResultsForm
        maxAttempts={quiz.maxAttempts}
        rows={rows}
        action={publishExamResults.bind(null, quizId)}
      />
    </div>
  );
}
