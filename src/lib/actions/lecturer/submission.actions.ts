"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertLecturerOwnsModule } from "@/lib/auth/ownership";
import { isModuleGradesLocked, MODULE_GRADES_LOCKED_MESSAGE } from "@/lib/grades/lock";
import { gradeSchema } from "@/lib/validation/grade.schema";
import { notifyUsers } from "@/lib/notifications";
import { assignmentGradedTemplate } from "@/lib/notifications/templates/communication";
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
  if (await isModuleGradesLocked(moduleId)) {
    return { error: MODULE_GRADES_LOCKED_MESSAGE };
  }

  const parsed = gradeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const submission = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      grade: parsed.data.grade,
      feedback: parsed.data.feedback || null,
      gradedAt: new Date(),
      gradedById: lecturer.id,
    },
    include: { contentItem: { include: { week: { include: { module: true } } } } },
  });

  await notifyUsers(
    [submission.studentId],
    "ASSIGNMENT_GRADED",
    assignmentGradedTemplate({
      contentItemTitle: submission.contentItem.title,
      moduleCode: submission.contentItem.week.module.code,
      grade: Number(submission.grade),
    })
  );

  revalidatePath(`/lecturer/modules/${moduleId}/assignments/${contentItemId}`);
  return undefined;
}
