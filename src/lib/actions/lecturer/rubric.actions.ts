"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { getOwnedQuiz } from "@/lib/actions/lecturer/quiz.actions";
import { isModuleGradesLocked, MODULE_GRADES_LOCKED_MESSAGE } from "@/lib/grades/lock";
import { rubricCriterionSchema } from "@/lib/validation/rubric-criterion.schema";
import type { ActionState } from "@/lib/actions/action-state";

export async function createRubricCriterion(
  quizId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  const quiz = await getOwnedQuiz(quizId, lecturer.id);
  if (quiz.kind !== "PRACTICAL" || quiz.status !== "DRAFT") {
    return { error: "Criteria can only be edited while a practical assessment is a draft." };
  }

  const parsed = rubricCriterionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const orderIndex = await prisma.rubricCriterion.count({ where: { quizId } });
  await prisma.rubricCriterion.create({ data: { ...parsed.data, quizId, orderIndex } });

  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}`);
  return undefined;
}

export async function deleteRubricCriterion(criterionId: string, quizId: string) {
  const lecturer = await requireRole(["LECTURER"]);
  const quiz = await getOwnedQuiz(quizId, lecturer.id);
  if (quiz.kind !== "PRACTICAL" || quiz.status !== "DRAFT") {
    throw new Error("Criteria can only be edited while a practical assessment is a draft.");
  }

  await prisma.rubricCriterion.delete({ where: { id: criterionId } });

  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}`);
}

export async function scorePracticalAttempt(
  quizId: string,
  studentId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  const quiz = await getOwnedQuiz(quizId, lecturer.id);
  if (quiz.kind !== "PRACTICAL" || quiz.status !== "PUBLISHED") {
    return { error: "This practical assessment isn't open for scoring." };
  }
  if (await isModuleGradesLocked(quiz.moduleId)) {
    return { error: MODULE_GRADES_LOCKED_MESSAGE };
  }

  const criteria = await prisma.rubricCriterion.findMany({ where: { quizId } });
  if (criteria.length === 0) {
    return { error: "Add rubric criteria before scoring students." };
  }

  const scores: { criterionId: string; pointsAwarded: number }[] = [];
  for (const criterion of criteria) {
    const raw = formData.get(`score_${criterion.id}`);
    const value = typeof raw === "string" ? Number(raw) : NaN;
    if (!Number.isInteger(value)) {
      return { error: `Enter a whole number score for "${criterion.name}".` };
    }
    const clamped = Math.max(0, Math.min(value, criterion.maxPoints));
    scores.push({ criterionId: criterion.id, pointsAwarded: clamped });
  }

  const pointsEarned = scores.reduce((sum, s) => sum + s.pointsAwarded, 0);
  const totalPoints = criteria.reduce((sum, c) => sum + c.maxPoints, 0);
  const now = new Date();

  const attempt = await prisma.quizAttempt.upsert({
    where: { quizId_studentId_attemptNumber: { quizId, studentId, attemptNumber: 1 } },
    update: { pointsEarned, totalPoints, submittedAt: now, resultsPublishedAt: now },
    create: {
      quizId,
      studentId,
      attemptNumber: 1,
      startedAt: now,
      submittedAt: now,
      pointsEarned,
      totalPoints,
      resultsPublishedAt: now,
    },
  });

  await prisma.$transaction(
    scores.map((score) =>
      prisma.rubricScore.upsert({
        where: { criterionId_attemptId: { criterionId: score.criterionId, attemptId: attempt.id } },
        update: { pointsAwarded: score.pointsAwarded },
        create: { criterionId: score.criterionId, attemptId: attempt.id, pointsAwarded: score.pointsAwarded },
      })
    )
  );

  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}/score`);
  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}/results`);
  revalidatePath(`/student/modules/${quiz.moduleId}/quizzes/${quizId}`);
  return undefined;
}
