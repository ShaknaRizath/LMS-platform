"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertLecturerOwnsModule } from "@/lib/auth/ownership";
import { gradeSchema } from "@/lib/validation/grade.schema";
import type { ActionState } from "@/lib/actions/action-state";

export async function gradeSubmission(
  submissionId: string,
  moduleId: string,
  contentItemId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  const parsed = gradeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      grade: parsed.data.grade,
      feedback: parsed.data.feedback || null,
      gradedAt: new Date(),
      gradedById: lecturer.id,
    },
  });

  revalidatePath(`/lecturer/modules/${moduleId}/assignments/${contentItemId}`);
  return undefined;
}
