"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertStudentEnrolledInModule } from "@/lib/auth/ownership";
import type { ActionState } from "@/lib/actions/action-state";

function isQuizTakeable(
  quiz: { status: string; availableFrom: Date | null; availableUntil: Date | null },
  now: Date
) {
  if (quiz.status === "PUBLISHED") return true;
  if (quiz.status === "SCHEDULED") {
    return (!quiz.availableFrom || quiz.availableFrom <= now) && (!quiz.availableUntil || quiz.availableUntil >= now);
  }
  return false;
}

export async function startAttempt(
  quizId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const student = await requireRole(["STUDENT"]);

  const quiz = await prisma.quiz.findUniqueOrThrow({ where: { id: quizId } });
  await assertStudentEnrolledInModule(quiz.moduleId, student.id);

  if (!isQuizTakeable(quiz, new Date())) {
    return { error: "This quiz is not currently available." };
  }

  const existingAttempts = await prisma.quizAttempt.findMany({
    where: { quizId, studentId: student.id },
    orderBy: { attemptNumber: "desc" },
  });

  const inProgress = existingAttempts.find((attempt) => !attempt.submittedAt);
  if (inProgress) {
    redirect(`/student/modules/${quiz.moduleId}/quizzes/${quizId}/attempt/${inProgress.id}`);
  }

  if (existingAttempts.length >= quiz.maxAttempts) {
    return { error: "You have used all your attempts for this quiz." };
  }

  const attempt = await prisma.quizAttempt.create({
    data: { quizId, studentId: student.id, attemptNumber: existingAttempts.length + 1 },
  });

  revalidatePath(`/student/modules/${quiz.moduleId}/quizzes/${quizId}`);
  redirect(`/student/modules/${quiz.moduleId}/quizzes/${quizId}/attempt/${attempt.id}`);
}

export async function submitAttempt(
  attemptId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const student = await requireRole(["STUDENT"]);

  const attempt = await prisma.quizAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: {
      quiz: { include: { questions: { include: { options: true }, orderBy: { orderIndex: "asc" } } } },
    },
  });
  if (attempt.studentId !== student.id) {
    throw new Error("This attempt does not belong to you.");
  }
  if (attempt.submittedAt) {
    return { error: "This attempt has already been submitted." };
  }

  let pointsEarned = 0;
  let totalPoints = 0;
  const answerData = attempt.quiz.questions.map((question) => {
    totalPoints += question.points;

    if (question.type === "ESSAY") {
      const rawTextResponse = formData.get(`question_${question.id}`);
      return {
        questionId: question.id,
        selectedOptionId: null,
        isCorrect: null,
        textResponse: typeof rawTextResponse === "string" ? rawTextResponse : null,
        pointsAwarded: null,
      };
    }

    const rawSelectedOptionId = formData.get(`question_${question.id}`);
    const selectedOption =
      typeof rawSelectedOptionId === "string"
        ? question.options.find((option) => option.id === rawSelectedOptionId)
        : undefined;
    const isCorrect = selectedOption?.isCorrect ?? false;
    const pointsAwarded = isCorrect ? question.points : 0;
    pointsEarned += pointsAwarded;
    return {
      questionId: question.id,
      selectedOptionId: selectedOption?.id ?? null,
      isCorrect,
      textResponse: null,
      pointsAwarded,
    };
  });

  const isLate =
    attempt.quiz.timeLimitMinutes != null &&
    new Date() > new Date(attempt.startedAt.getTime() + attempt.quiz.timeLimitMinutes * 60_000);

  // Always stays hidden on submit, even when every question auto-graded — the score is
  // computed immediately, but publishing is a deliberate decision by whoever owns that
  // decision: the lecturer for QUIZ/PRACTICAL (publishAttemptResults), or the
  // Examination Unit for EXAM, releasing every student's result at once
  // (publishExamResults) so results become visible simultaneously, not as each student
  // happens to finish.
  const now = new Date();

  await prisma.$transaction([
    prisma.quizAnswer.createMany({ data: answerData.map((answer) => ({ ...answer, attemptId })) }),
    prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAt: now,
        pointsEarned,
        totalPoints,
        resultsPublishedAt: null,
      },
    }),
  ]);

  revalidatePath(`/student/modules/${attempt.quiz.moduleId}/quizzes/${attempt.quizId}`);
  revalidatePath(`/student/modules/${attempt.quiz.moduleId}/quizzes/${attempt.quizId}/attempt/${attemptId}`);
  revalidatePath(`/lecturer/modules/${attempt.quiz.moduleId}/quizzes/${attempt.quizId}/results`);

  return isLate ? { error: "Submitted after the time limit — your answers were still recorded." } : undefined;
}
