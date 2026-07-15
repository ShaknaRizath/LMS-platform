"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertLecturerOwnsModule } from "@/lib/auth/ownership";
import { assessmentCategorySchema } from "@/lib/validation/assessment-category.schema";
import type { ActionState } from "@/lib/actions/action-state";

const CATEGORY_MANAGE_ROLES = ["SUPER_ADMIN", "CAMPUS_ADMIN", "LECTURER"] as const;

async function authorize(moduleId: string) {
  const user = await requireRole([...CATEGORY_MANAGE_ROLES]);
  if (user.role === "LECTURER") {
    await assertLecturerOwnsModule(moduleId, user.id);
  }
  return user;
}

function revalidateCategorySurfaces(moduleId: string) {
  revalidatePath(`/admin/modules/${moduleId}`);
  revalidatePath(`/lecturer/modules/${moduleId}/gradebook`);
}

export async function createAssessmentCategory(
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await authorize(moduleId);

  const parsed = assessmentCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const existing = await prisma.assessmentCategory.findMany({
    where: { moduleId },
    select: { weightPercent: true },
  });
  const currentTotal = existing.reduce((sum, c) => sum + c.weightPercent, 0);
  if (currentTotal + parsed.data.weightPercent > 100) {
    return {
      error: `Total weight would be ${currentTotal + parsed.data.weightPercent}% — categories can't exceed 100% total (currently ${currentTotal}%).`,
    };
  }

  try {
    await prisma.assessmentCategory.create({ data: { ...parsed.data, moduleId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A category with this name already exists for this module." };
    }
    throw error;
  }

  revalidateCategorySurfaces(moduleId);
  return undefined;
}

export async function updateAssessmentCategory(
  categoryId: string,
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await authorize(moduleId);

  const parsed = assessmentCategorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const existing = await prisma.assessmentCategory.findMany({
    where: { moduleId, id: { not: categoryId } },
    select: { weightPercent: true },
  });
  const currentTotal = existing.reduce((sum, c) => sum + c.weightPercent, 0);
  if (currentTotal + parsed.data.weightPercent > 100) {
    return {
      error: `Total weight would be ${currentTotal + parsed.data.weightPercent}% — categories can't exceed 100% total (currently ${currentTotal}% excluding this one).`,
    };
  }

  await prisma.assessmentCategory.update({ where: { id: categoryId }, data: parsed.data });

  revalidateCategorySurfaces(moduleId);
  return undefined;
}

export async function deleteAssessmentCategory(categoryId: string, moduleId: string) {
  await authorize(moduleId);

  await prisma.assessmentCategory.delete({ where: { id: categoryId } });

  revalidateCategorySurfaces(moduleId);
}
