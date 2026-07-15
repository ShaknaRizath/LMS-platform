"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertLecturerOwnsModule } from "@/lib/auth/ownership";
import { announcementSchema } from "@/lib/validation/announcement.schema";
import { notifyUsers } from "@/lib/notifications";
import { announcementNotificationTemplate } from "@/lib/notifications/templates/communication";
import type { ActionState } from "@/lib/actions/action-state";

export async function createModuleAnnouncement(
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  const parsed = announcementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const [, module_, enrollments] = await Promise.all([
    prisma.announcement.create({
      data: { ...parsed.data, scope: "MODULE", moduleId, authorId: lecturer.id },
    }),
    prisma.module.findUniqueOrThrow({ where: { id: moduleId }, select: { code: true } }),
    prisma.enrollment.findMany({ where: { moduleId, status: "ACTIVE" }, select: { studentId: true } }),
  ]);
  await notifyUsers(
    enrollments.map((enrollment) => enrollment.studentId),
    "ANNOUNCEMENT_MODULE",
    announcementNotificationTemplate({ title: parsed.data.title, body: parsed.data.body, moduleCode: module_.code })
  );

  revalidatePath(`/lecturer/modules/${moduleId}/announcements`);
  revalidatePath(`/lecturer/announcements`);
  return undefined;
}

export async function updateModuleAnnouncement(
  announcementId: string,
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  const parsed = announcementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.announcement.update({
    where: { id: announcementId },
    data: parsed.data,
  });

  revalidatePath(`/lecturer/modules/${moduleId}/announcements`);
  revalidatePath(`/lecturer/announcements`);
  return undefined;
}

export async function deleteModuleAnnouncement(announcementId: string, moduleId: string) {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  await prisma.announcement.delete({ where: { id: announcementId } });

  revalidatePath(`/lecturer/modules/${moduleId}/announcements`);
  revalidatePath(`/lecturer/announcements`);
}
