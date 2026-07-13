"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertLecturerOwnsModule } from "@/lib/auth/ownership";
import { quizSchema } from "@/lib/validation/quiz.schema";
import { questionSchema, buildQuestionInput, type QuestionInput } from "@/lib/validation/quiz-question.schema";
import { essayGradeSchema } from "@/lib/validation/essay-grade.schema";
import type { ActionState } from "@/lib/actions/action-state";

function buildOptionsData(data: QuestionInput) {
  if (data.type === "MCQ") {
    return data.options.map((text, index) => ({
      text,
      isCorrect: index === data.correctIndex,
      orderIndex: index,
    }));
  }
  if (data.type === "TRUE_FALSE") {
    return [
      { text: "True", isCorrect: data.correctAnswer === "true", orderIndex: 0 },
      { text: "False", isCorrect: data.correctAnswer === "false", orderIndex: 1 },
    ];
  }
  return [];
}

async function getOwnedQuiz(quizId: string, lecturerId: string) {
  const quiz = await prisma.quiz.findUniqueOrThrow({ where: { id: quizId } });
  await assertLecturerOwnsModule(quiz.moduleId, lecturerId);
  return quiz;
}

export async function createQuiz(
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  const parsed = quizSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const quiz = await prisma.quiz.create({
    data: { ...parsed.data, moduleId, createdById: lecturer.id },
  });

  revalidatePath(`/lecturer/modules/${moduleId}/quizzes`);
  redirect(`/lecturer/modules/${moduleId}/quizzes/${quiz.id}`);
}

export async function updateQuiz(
  quizId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  const quiz = await getOwnedQuiz(quizId, lecturer.id);
  if (quiz.status !== "DRAFT") {
    return { error: "This quiz is no longer a draft and can't be edited." };
  }

  const parsed = quizSchema.omit({ kind: true }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.quiz.update({ where: { id: quizId }, data: parsed.data });

  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}`);
  return undefined;
}

export async function addQuestion(
  quizId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  const quiz = await getOwnedQuiz(quizId, lecturer.id);
  if (quiz.status !== "DRAFT") {
    return { error: "Questions can only be edited while the quiz is a draft." };
  }

  const parsed = questionSchema.safeParse(buildQuestionInput(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const orderIndex = await prisma.quizQuestion.count({ where: { quizId } });
  const data = parsed.data;
  const optionsData = buildOptionsData(data);

  await prisma.quizQuestion.create({
    data: {
      quizId,
      type: data.type,
      prompt: data.prompt,
      points: data.points,
      orderIndex,
      options: optionsData.length > 0 ? { create: optionsData } : undefined,
    },
  });

  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}`);
  return undefined;
}

export async function updateQuestion(
  questionId: string,
  quizId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  const quiz = await getOwnedQuiz(quizId, lecturer.id);
  if (quiz.status !== "DRAFT") {
    return { error: "Questions can only be edited while the quiz is a draft." };
  }

  const parsed = questionSchema.safeParse(buildQuestionInput(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const data = parsed.data;
  const optionsData = buildOptionsData(data);

  await prisma.$transaction([
    prisma.quizOption.deleteMany({ where: { questionId } }),
    prisma.quizQuestion.update({
      where: { id: questionId },
      data: {
        type: data.type,
        prompt: data.prompt,
        points: data.points,
        options: optionsData.length > 0 ? { create: optionsData } : undefined,
      },
    }),
  ]);

  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}`);
  return undefined;
}

export async function deleteQuestion(questionId: string, quizId: string) {
  const lecturer = await requireRole(["LECTURER"]);
  const quiz = await getOwnedQuiz(quizId, lecturer.id);
  if (quiz.status !== "DRAFT") {
    throw new Error("Questions can only be edited while the quiz is a draft.");
  }

  await prisma.quizQuestion.delete({ where: { id: questionId } });

  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}`);
}

export async function publishQuiz(quizId: string) {
  const lecturer = await requireRole(["LECTURER"]);
  const quiz = await getOwnedQuiz(quizId, lecturer.id);
  if (quiz.kind !== "QUIZ" || quiz.status !== "DRAFT") {
    throw new Error("This quiz can't be published from its current state.");
  }
  const questionCount = await prisma.quizQuestion.count({ where: { quizId } });
  if (questionCount === 0) {
    throw new Error("Add at least one question before publishing.");
  }

  await prisma.quiz.update({ where: { id: quizId }, data: { status: "PUBLISHED" } });

  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes`);
  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}`);
}

export async function submitExamForScheduling(quizId: string) {
  const lecturer = await requireRole(["LECTURER"]);
  const quiz = await getOwnedQuiz(quizId, lecturer.id);
  if (quiz.kind !== "EXAM" || quiz.status !== "DRAFT") {
    throw new Error("This exam can't be submitted for scheduling from its current state.");
  }
  const questionCount = await prisma.quizQuestion.count({ where: { quizId } });
  if (questionCount === 0) {
    throw new Error("Add at least one question before submitting for scheduling.");
  }

  await prisma.quiz.update({
    where: { id: quizId },
    data: { submittedForSchedulingAt: new Date() },
  });

  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes`);
  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}`);
  revalidatePath(`/examinations/exams`);
}

export async function closeQuiz(quizId: string) {
  const lecturer = await requireRole(["LECTURER"]);
  const quiz = await getOwnedQuiz(quizId, lecturer.id);
  if (quiz.status !== "PUBLISHED" && quiz.status !== "SCHEDULED") {
    throw new Error("Only a live quiz or exam can be closed.");
  }

  await prisma.quiz.update({ where: { id: quizId }, data: { status: "CLOSED" } });

  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes`);
  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}`);
}

export async function gradeEssayAnswer(
  answerId: string,
  quizId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  const quiz = await getOwnedQuiz(quizId, lecturer.id);

  const answer = await prisma.quizAnswer.findUniqueOrThrow({
    where: { id: answerId },
    include: { question: true },
  });
  if (answer.question.quizId !== quizId || answer.question.type !== "ESSAY") {
    return { error: "This answer can't be graded here." };
  }

  const parsed = essayGradeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }
  if (parsed.data.pointsAwarded > answer.question.points) {
    return { error: `Points can't exceed the question's max of ${answer.question.points}.` };
  }

  await prisma.quizAnswer.update({
    where: { id: answerId },
    data: { pointsAwarded: parsed.data.pointsAwarded },
  });

  const allAnswers = await prisma.quizAnswer.findMany({ where: { attemptId: answer.attemptId } });
  const pointsEarned = allAnswers.reduce((sum, a) => sum + (a.pointsAwarded ?? 0), 0);
  await prisma.quizAttempt.update({ where: { id: answer.attemptId }, data: { pointsEarned } });

  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}/results`);
  revalidatePath(`/student/modules/${quiz.moduleId}/quizzes/${quizId}/attempt/${answer.attemptId}`);
  return undefined;
}
