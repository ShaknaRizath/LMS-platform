"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { scheduleExamSchema } from "@/lib/validation/schedule-exam.schema";
import type { ActionState } from "@/lib/actions/action-state";

// Scoped to status: "SCHEDULED" — a DRAFT or CLOSED exam doesn't occupy a venue. Mirrors
// checkSessionConflict in scheduling/class-session.actions.ts, but compares real DateTime
// ranges directly instead of that function's "HH:MM" string trick (unnecessary here since
// Prisma compares DateTime natively).
async function checkExamConflict(params: {
  venue: string;
  invigilatorId: string;
  availableFrom: Date;
  availableUntil: Date;
  excludeId?: string;
}) {
  const { venue, invigilatorId, availableFrom, availableUntil, excludeId } = params;

  const conflict = await prisma.quiz.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      kind: "EXAM",
      status: "SCHEDULED",
      OR: [{ venue }, { invigilatorId }],
      availableFrom: { lt: availableUntil },
      availableUntil: { gt: availableFrom },
    },
    include: { invigilator: true },
  });

  if (!conflict) return null;

  if (conflict.venue === venue) {
    return `Venue "${venue}" is already booked ${conflict.availableFrom!.toLocaleString()}–${conflict.availableUntil!.toLocaleString()} for another exam.`;
  }
  return `${conflict.invigilator!.firstName} ${conflict.invigilator!.lastName} is already invigilating ${conflict.availableFrom!.toLocaleString()}–${conflict.availableUntil!.toLocaleString()}.`;
}

export async function scheduleExam(
  quizId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const examUnit = await requireRole(["EXAMINATION_UNIT"]);

  const quiz = await prisma.quiz.findUniqueOrThrow({
    where: { id: quizId },
    include: { module: true },
  });
  if (quiz.kind !== "EXAM" || !quiz.submittedForSchedulingAt || quiz.status !== "DRAFT") {
    return { error: "This exam is not awaiting scheduling." };
  }

  const parsed = scheduleExamSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const conflictMessage = await checkExamConflict({
    venue: parsed.data.venue,
    invigilatorId: parsed.data.invigilatorId,
    availableFrom: parsed.data.availableFrom,
    availableUntil: parsed.data.availableUntil,
  });
  if (conflictMessage) {
    return { error: conflictMessage };
  }

  await prisma.$transaction([
    prisma.quiz.update({
      where: { id: quizId },
      data: {
        availableFrom: parsed.data.availableFrom,
        availableUntil: parsed.data.availableUntil,
        venue: parsed.data.venue,
        invigilatorId: parsed.data.invigilatorId,
        scheduledById: examUnit.id,
        status: "SCHEDULED",
      },
    }),
    prisma.calendarEvent.create({
      data: {
        title: `${quiz.title} (Exam)`,
        description: `${quiz.module.code} — ${quiz.module.title}`,
        type: "EXAM_PERIOD",
        startDate: parsed.data.availableFrom,
        endDate: parsed.data.availableUntil,
        isAllDay: false,
        academicYearId: quiz.module.academicYearId,
        semesterId: quiz.module.semesterId,
        createdById: examUnit.id,
      },
    }),
  ]);

  revalidatePath("/examinations");
  revalidatePath("/examinations/exams");
  revalidatePath("/admin");
  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes`);
  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}`);
  return undefined;
}

export async function closeExam(quizId: string) {
  await requireRole(["EXAMINATION_UNIT"]);

  const quiz = await prisma.quiz.findUniqueOrThrow({ where: { id: quizId } });
  if (quiz.kind !== "EXAM" || quiz.status !== "SCHEDULED") {
    throw new Error("Only a scheduled exam can be closed.");
  }

  await prisma.quiz.update({ where: { id: quizId }, data: { status: "CLOSED" } });

  revalidatePath("/examinations");
  revalidatePath("/examinations/exams");
}
