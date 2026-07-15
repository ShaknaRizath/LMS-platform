"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertLecturerOwnsModule } from "@/lib/auth/ownership";
import { getOwnedQuiz } from "@/lib/actions/lecturer/quiz.actions";
import { learningOutcomeSchema } from "@/lib/validation/learning-outcome.schema";
import type { ActionState } from "@/lib/actions/action-state";

const OUTCOME_MANAGE_ROLES = ["SUPER_ADMIN", "CAMPUS_ADMIN", "LECTURER"] as const;

async function authorize(moduleId: string) {
  const user = await requireRole([...OUTCOME_MANAGE_ROLES]);
  if (user.role === "LECTURER") {
    await assertLecturerOwnsModule(moduleId, user.id);
  }
  return user;
}

function revalidateOutcomeSurfaces(moduleId: string, quizId?: string) {
  revalidatePath(`/lecturer/modules/${moduleId}/quizzes`);
  if (quizId) revalidatePath(`/lecturer/modules/${moduleId}/quizzes/${quizId}`);
}

export async function createLearningOutcome(
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await authorize(moduleId);

  const parsed = learningOutcomeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await prisma.learningOutcome.create({ data: { ...parsed.data, moduleId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A learning outcome with this code already exists for this module." };
    }
    throw error;
  }

  revalidateOutcomeSurfaces(moduleId);
  return undefined;
}

export async function deleteLearningOutcome(outcomeId: string, moduleId: string) {
  await authorize(moduleId);

  await prisma.learningOutcome.delete({ where: { id: outcomeId } });

  revalidateOutcomeSurfaces(moduleId);
}

export async function setQuizLearningOutcomes(
  quizId: string,
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await authorize(moduleId);
  if (user.role === "LECTURER") {
    await getOwnedQuiz(quizId, user.id);
  }

  const outcomeIds = formData.getAll("outcomeIds").filter((v): v is string => typeof v === "string");

  await prisma.quiz.update({
    where: { id: quizId },
    data: { learningOutcomes: { set: outcomeIds.map((id) => ({ id })) } },
  });

  revalidateOutcomeSurfaces(moduleId, quizId);
  return undefined;
}
