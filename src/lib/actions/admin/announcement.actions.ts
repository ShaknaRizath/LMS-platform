"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { announcementSchema } from "@/lib/validation/announcement.schema";
import { notifyUsers } from "@/lib/notifications";
import { announcementNotificationTemplate } from "@/lib/notifications/templates/communication";
import type { ActionState } from "@/lib/actions/action-state";

export async function createInstitutionAnnouncement(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole(["SUPER_ADMIN", "CAMPUS_ADMIN"]);

  const parsed = announcementSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.announcement.create({
    data: { ...parsed.data, scope: "INSTITUTION", authorId: admin.id },
  });

  const students = await prisma.user.findMany({
    where: { role: "STUDENT", isActive: true },
    select: { id: true },
  });
  await notifyUsers(
    students.map((student) => student.id),
    "ANNOUNCEMENT_INSTITUTION",
    announcementNotificationTemplate({ title: parsed.data.title, body: parsed.data.body })
  );

  revalidatePath("/admin/announcements");
  revalidatePath("/lecturer/announcements");
  revalidatePath("/student/announcements");
  return undefined;
}

export async function deleteInstitutionAnnouncement(announcementId: string) {
  await requireRole(["SUPER_ADMIN", "CAMPUS_ADMIN"]);

  await prisma.announcement.delete({ where: { id: announcementId } });

  revalidatePath("/admin/announcements");
  revalidatePath("/lecturer/announcements");
  revalidatePath("/student/announcements");
}
