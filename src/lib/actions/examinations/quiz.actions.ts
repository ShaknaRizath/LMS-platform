"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { scheduleExamSchema } from "@/lib/validation/schedule-exam.schema";
import { notifyUsers } from "@/lib/notifications";
import { quizResultsPublishedTemplate } from "@/lib/notifications/templates/communication";
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

// Releases only the attempts the Examination Unit explicitly selects on
// /examinations/exams/[quizId]/results — never a blind "publish everything." Lets them
// review who actually sat the exam and what they scored before any student sees it, and
// hold back individual students (e.g. suspected misconduct) while releasing the rest.
export async function publishExamResults(
  quizId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["EXAMINATION_UNIT"]);

  const quiz = await prisma.quiz.findUniqueOrThrow({ where: { id: quizId }, include: { module: true } });
  if (quiz.kind !== "EXAM") {
    return { error: "Only exams can be published from here." };
  }

  const selectedIds = formData.getAll("attemptIds").filter((value): value is string => typeof value === "string");
  if (selectedIds.length === 0) {
    return { error: "Select at least one student to publish." };
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: { id: { in: selectedIds }, quizId, submittedAt: { not: null }, resultsPublishedAt: null },
  });
  if (attempts.length === 0) {
    return { error: "None of the selected results can be published." };
  }

  const ungradedCount = await prisma.quizAnswer.count({
    where: {
      attemptId: { in: attempts.map((attempt) => attempt.id) },
      pointsAwarded: null,
      question: { type: "ESSAY" },
    },
  });
  if (ungradedCount > 0) {
    return { error: `${ungradedCount} essay answer(s) still need grading before these can be published.` };
  }

  await prisma.quizAttempt.updateMany({
    where: { id: { in: attempts.map((attempt) => attempt.id) } },
    data: { resultsPublishedAt: new Date() },
  });

  // Sequential — each notifyUsers call does its own queries, and this is a one-time
  // release action, not a hot path, so fanning out with Promise.all isn't worth the
  // connection-pool risk.
  for (const attempt of attempts) {
    await notifyUsers(
      [attempt.studentId],
      "QUIZ_RESULTS_PUBLISHED",
      quizResultsPublishedTemplate({
        quizTitle: quiz.title,
        moduleCode: quiz.module.code,
        pointsEarned: attempt.pointsEarned ?? undefined,
        totalPoints: attempt.totalPoints ?? undefined,
      })
    );
  }

  revalidatePath("/examinations/exams");
  revalidatePath(`/examinations/exams/${quizId}/results`);
  revalidatePath(`/lecturer/modules/${quiz.moduleId}/quizzes/${quizId}/results`);
  revalidatePath(`/student/modules/${quiz.moduleId}/quizzes`);
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
