"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertStudentEnrolledInModule } from "@/lib/auth/ownership";
import { submissionSchema } from "@/lib/validation/submission.schema";
import type { ActionState } from "@/lib/actions/action-state";

export async function submitAssignment(
  contentItemId: string,
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const student = await requireRole(["STUDENT"]);
  await assertStudentEnrolledInModule(moduleId, student.id);

  const contentItem = await prisma.contentItem.findUniqueOrThrow({ where: { id: contentItemId } });
  if (!contentItem.isAssignment) {
    return { error: "This content item is not an assignment." };
  }

  const existing = await prisma.submission.findUnique({
    where: { contentItemId_studentId: { contentItemId, studentId: student.id } },
  });
  if (existing?.gradedAt) {
    return { error: "This assignment has already been graded and can no longer be resubmitted." };
  }

  const parsed = submissionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { textResponse, fileUrl } = parsed.data;

  await prisma.submission.upsert({
    where: { contentItemId_studentId: { contentItemId, studentId: student.id } },
    create: {
      contentItemId,
      studentId: student.id,
      textResponse: textResponse || null,
      fileUrl: fileUrl || null,
    },
    update: {
      textResponse: textResponse || null,
      fileUrl: fileUrl || null,
      submittedAt: new Date(),
    },
  });

  revalidatePath(`/student/modules/${moduleId}/assignments/${contentItemId}`);
  revalidatePath(`/student/modules/${moduleId}`);
  return undefined;
}
