"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { calendarEventSchema } from "@/lib/validation/calendar-event.schema";
import type { ActionState } from "@/lib/actions/action-state";

export async function createCalendarEvent(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = calendarEventSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.calendarEvent.create({
    data: { ...parsed.data, createdById: admin.id },
  });

  revalidatePath("/admin/calendar");
  revalidatePath("/lecturer/calendar");
  revalidatePath("/student/calendar");
  return undefined;
}

export async function deleteCalendarEvent(eventId: string) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  await prisma.calendarEvent.delete({ where: { id: eventId } });

  revalidatePath("/admin/calendar");
  revalidatePath("/lecturer/calendar");
  revalidatePath("/student/calendar");
}
