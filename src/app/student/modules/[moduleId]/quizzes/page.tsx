import Link from "next/link";
import { notFound } from "next/navigation";
import { ListChecks, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

const KIND_LABELS: Record<string, string> = {
  QUIZ: "Quiz",
  EXAM: "Exam",
  PRACTICAL: "Practical",
};

export default async function StudentQuizzesPage({
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

  const quizzes = await prisma.quiz.findMany({
    where: { moduleId, status: { in: ["PUBLISHED", "SCHEDULED", "CLOSED"] } },
    include: { attempts: { where: { studentId: student.id } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Quizzes &amp; Exams</h1>

      {quizzes.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ListChecks />
            </EmptyMedia>
            <EmptyTitle>Nothing here yet</EmptyTitle>
            <EmptyDescription>Quizzes and exams will appear here once published.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {quizzes.map((quiz) => {
            const submitted = quiz.attempts.filter((attempt) => attempt.submittedAt);
            const inProgress = quiz.attempts.find((attempt) => !attempt.submittedAt);
            const awaitingGrading = submitted.some((attempt) => !attempt.resultsPublishedAt);
            const best = submitted.reduce<number | null>((acc, attempt) => {
              if (
                !attempt.resultsPublishedAt ||
                attempt.pointsEarned == null ||
                attempt.totalPoints == null ||
                attempt.totalPoints === 0
              ) {
                return acc;
              }
              const pct = Math.round((attempt.pointsEarned / attempt.totalPoints) * 100);
              return acc === null || pct > acc ? pct : acc;
            }, null);

            const statusLabel = inProgress
              ? "In progress"
              : best !== null
                ? `Completed: ${best}%`
                : awaitingGrading
                  ? "Submitted — awaiting grading"
                  : quiz.status === "SCHEDULED"
                    ? "Scheduled"
                    : quiz.status === "CLOSED"
                      ? "Closed"
                      : quiz.kind === "PRACTICAL"
                        ? "Awaiting assessment"
                        : "Not started";

            return (
              <Link key={quiz.id} href={`/student/modules/${moduleId}/quizzes/${quiz.id}`}>
                <Card className="transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle>{quiz.title}</CardTitle>
                          <Badge variant="outline">{KIND_LABELS[quiz.kind]}</Badge>
                        </div>
                        <CardDescription>
                          {statusLabel} · {quiz.attempts.length} / {quiz.maxAttempts} attempt
                          {quiz.maxAttempts === 1 ? "" : "s"} used
                        </CardDescription>
                      </div>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
