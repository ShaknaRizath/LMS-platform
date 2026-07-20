"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";
import { basicProfileSchema } from "@/lib/validation/basic-profile.schema";
import type { ActionState } from "@/lib/actions/action-state";

// Shared "My profile" self-service update for every non-STUDENT role — bind the
// view-page path with .bind(null, viewHref) from each role's edit page.
export async function updateOwnProfile(
  viewHref: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = basicProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.user.update({ where: { id: user.id }, data: parsed.data });

  revalidatePath(viewHref);
  redirect(viewHref);
}
