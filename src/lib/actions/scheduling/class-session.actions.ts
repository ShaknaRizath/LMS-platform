"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { classSessionSchema } from "@/lib/validation/class-session.schema";
import type { ActionState } from "@/lib/actions/action-state";
import type { DayOfWeek, Role } from "@/generated/prisma/client";

const SCHEDULING_ROLES: Role[] = ["SUPER_ADMIN", "CAMPUS_ADMIN", "PROGRAM_COORDINATOR"];

function revalidateScheduleSurfaces(moduleId: string) {
  revalidatePath(`/admin/modules/${moduleId}`);
  revalidatePath("/coordinator/timetables");
  revalidatePath(`/coordinator/timetables/${moduleId}`);
  revalidatePath("/lecturer/schedule");
}

async function checkSessionConflict(params: {
  semesterId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
  lecturerId: string;
  excludeId?: string;
}) {
  const { semesterId, dayOfWeek, startTime, endTime, room, lecturerId, excludeId } = params;

  const conflict = await prisma.classSession.findFirst({
    where: {
      id: excludeId ? { not: excludeId } : undefined,
      dayOfWeek,
      module: { semesterId },
      OR: [{ room }, { lecturerId }],
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
    include: { module: true, lecturer: true },
  });

  if (!conflict) return null;

  if (conflict.room === room) {
    return `Room "${room}" is already booked ${dayOfWeek.toLowerCase()} ${conflict.startTime}-${conflict.endTime} for ${conflict.module.code}.`;
  }
  return `${conflict.lecturer.firstName} ${conflict.lecturer.lastName} is already teaching ${dayOfWeek.toLowerCase()} ${conflict.startTime}-${conflict.endTime} (${conflict.module.code}).`;
}

export async function createClassSession(
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(SCHEDULING_ROLES);

  const parsed = classSessionSchema.safeParse({ ...Object.fromEntries(formData), moduleId });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const module_ = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { semesterId: true },
  });
  if (!module_) {
    return { error: "Module could not be found." };
  }

  const conflictMessage = await checkSessionConflict({
    semesterId: module_.semesterId,
    dayOfWeek: parsed.data.dayOfWeek,
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime,
    room: parsed.data.room,
    lecturerId: parsed.data.lecturerId,
  });
  if (conflictMessage) {
    return { error: conflictMessage };
  }

  await prisma.classSession.create({ data: parsed.data });

  revalidateScheduleSurfaces(moduleId);
  return undefined;
}

export async function updateClassSession(
  sessionId: string,
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(SCHEDULING_ROLES);

  const parsed = classSessionSchema.safeParse({ ...Object.fromEntries(formData), moduleId });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const module_ = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { semesterId: true },
  });
  if (!module_) {
    return { error: "Module could not be found." };
  }

  const conflictMessage = await checkSessionConflict({
    semesterId: module_.semesterId,
    dayOfWeek: parsed.data.dayOfWeek,
    startTime: parsed.data.startTime,
    endTime: parsed.data.endTime,
    room: parsed.data.room,
    lecturerId: parsed.data.lecturerId,
    excludeId: sessionId,
  });
  if (conflictMessage) {
    return { error: conflictMessage };
  }

  await prisma.classSession.update({ where: { id: sessionId }, data: parsed.data });

  revalidateScheduleSurfaces(moduleId);
  return undefined;
}

export async function deleteClassSession(sessionId: string, moduleId: string) {
  await requireRole(SCHEDULING_ROLES);

  await prisma.classSession.delete({ where: { id: sessionId } });

  revalidateScheduleSurfaces(moduleId);
}
