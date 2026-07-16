"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { staffEmploymentSchema } from "@/lib/validation/staff-employment.schema";
import type { ActionState } from "@/lib/actions/action-state";

const STAFF_MANAGE_ROLES = ["HR_OFFICER", "SUPER_ADMIN", "CAMPUS_ADMIN"] as const;

export async function updateStaffEmploymentDetails(
  userId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole([...STAFF_MANAGE_ROLES]);

  const parsed = staffEmploymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.user.update({ where: { id: userId }, data: parsed.data });

  revalidatePath("/hr/staff");
  revalidatePath(`/hr/staff/${userId}`);
  revalidatePath("/hr");
  return undefined;
}
