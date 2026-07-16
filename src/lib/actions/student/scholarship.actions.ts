"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { applyScholarshipSchema } from "@/lib/validation/scholarship.schema";
import type { ActionState } from "@/lib/actions/action-state";

export async function applyForScholarship(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const student = await requireRole(["STUDENT"]);

  const parsed = applyScholarshipSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.scholarship.create({ data: { ...parsed.data, studentId: student.id } });

  revalidatePath("/student/scholarships");
  revalidatePath("/finance/scholarships");
  return undefined;
}
