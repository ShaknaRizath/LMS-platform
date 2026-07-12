"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { profileSchema } from "@/lib/validation/profile.schema";
import type { ActionState } from "@/lib/actions/action-state";

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const student = await requireRole(["STUDENT"]);

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.user.update({ where: { id: student.id }, data: parsed.data });

  revalidatePath("/student/profile");
  redirect("/student/profile");
}
