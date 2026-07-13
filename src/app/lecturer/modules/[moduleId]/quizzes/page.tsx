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
import { CreateQuizForm } from "@/components/lecturer/create-quiz-form";
import { createQuiz } from "@/lib/actions/lecturer/quiz.actions";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SCHEDULED: "Scheduled",
  PUBLISHED: "Published",
  CLOSED: "Closed",
};

export default async function LecturerQuizzesPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const lecturer = await requireRole(["LECTURER"]);

  const assignment = await prisma.lecturerModuleAssignment.findUnique({
    where: { lecturerId_moduleId: { lecturerId: lecturer.id, moduleId } },
  });
  if (!assignment) notFound();

  const quizzes = await prisma.quiz.findMany({
    where: { moduleId },
    include: { _count: { select: { questions: true, attempts: true } } },
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
            <EmptyTitle>No quizzes or exams yet</EmptyTitle>
            <EmptyDescription>Create one below to get started.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {quizzes.map((quiz) => (
            <Link key={quiz.id} href={`/lecturer/modules/${moduleId}/quizzes/${quiz.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle>{quiz.title}</CardTitle>
                        <Badge variant="outline">{quiz.kind === "EXAM" ? "Exam" : "Quiz"}</Badge>
                        <Badge variant={quiz.status === "PUBLISHED" || quiz.status === "SCHEDULED" ? "default" : "secondary"}>
                          {STATUS_LABELS[quiz.status]}
                        </Badge>
                      </div>
                      <CardDescription>
                        {quiz._count.questions} question{quiz._count.questions === 1 ? "" : "s"} ·{" "}
                        {quiz._count.attempts} attempt{quiz._count.attempts === 1 ? "" : "s"}
                      </CardDescription>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <CreateQuizForm action={createQuiz.bind(null, moduleId)} />
    </div>
  );
}
