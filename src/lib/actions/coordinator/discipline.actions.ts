"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { disciplineCaseSchema } from "@/lib/validation/discipline-case.schema";
import type { ActionState } from "@/lib/actions/action-state";

const DISCIPLINE_FILE_ROLES = ["PROGRAM_COORDINATOR", "SUPER_ADMIN", "CAMPUS_ADMIN"] as const;

export async function fileDisciplineCase(
  studentId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole([...DISCIPLINE_FILE_ROLES]);

  const parsed = disciplineCaseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.disciplineCase.create({
    data: { ...parsed.data, studentId, reportedById: user.id },
  });

  revalidatePath(`/coordinator/students/${studentId}`);
  revalidatePath("/academic/discipline");
  return undefined;
}
