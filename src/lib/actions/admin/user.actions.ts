"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { createUserSchema, updateUserSchema } from "@/lib/validation/user.schema";
import { hashPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/tokens";
import { sendNotificationEmail } from "@/lib/notifications";
import { welcomeSetPasswordTemplate } from "@/lib/notifications/templates/account";
import type { ActionState } from "@/lib/actions/action-state";

export async function createUser(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = createUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { password, ...userData } = parsed.data;

  // If the admin set a password directly, the account is immediately usable with it — no
  // invite email needed. Otherwise fall back to a random placeholder + emailed set-password
  // link (only reaches the user if a real email provider is configured; see user.schema.ts).
  const passwordHash = await hashPassword(password ?? generateToken());

  let userId: string;
  try {
    const user = await prisma.user.create({
      data: { ...userData, passwordHash },
    });
    userId = user.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A user with this email already exists." };
    }
    throw error;
  }

  if (!password) {
    const token = generateToken();
    await prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const setPasswordUrl = `${process.env.AUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
    const template = welcomeSetPasswordTemplate({
      firstName: parsed.data.firstName,
      setPasswordUrl,
    });
    await sendNotificationEmail("ACCOUNT_CREATED", { to: parsed.data.email, ...template }, userId);
  }

  revalidatePath("/admin/users");
  redirect(`/admin/users/${userId}`);
}

export async function updateUser(
  userId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = updateUserSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.user.update({ where: { id: userId }, data: parsed.data });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  redirect(`/admin/users/${userId}`);
}

export async function setUserActive(userId: string, isActive: boolean) {
  const admin = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  if (userId === admin.id && !isActive) {
    throw new Error("You cannot deactivate your own account.");
  }

  await prisma.user.update({ where: { id: userId }, data: { isActive } });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function deleteUser(
  userId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const admin = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  if (userId === admin.id) {
    return { error: "You cannot delete your own account." };
  }

  // Deliberately not cascading: unlike catalog structure (programs/modules), a user's own
  // history — grades, registrations, authored content — shouldn't vanish as a side effect
  // of removing their login. Accounts with any history must be deactivated instead.
  const [assignmentCount, registrationCount, enrollmentCount, announcementCount, calendarEventCount, contentItemCount, submissionCount] =
    await Promise.all([
      prisma.lecturerModuleAssignment.count({ where: { lecturerId: userId } }),
      prisma.semesterRegistration.count({ where: { studentId: userId } }),
      prisma.enrollment.count({ where: { studentId: userId } }),
      prisma.announcement.count({ where: { authorId: userId } }),
      prisma.calendarEvent.count({ where: { createdById: userId } }),
      prisma.contentItem.count({ where: { createdById: userId } }),
      prisma.submission.count({ where: { studentId: userId } }),
    ]);

  const total =
    assignmentCount +
    registrationCount +
    enrollmentCount +
    announcementCount +
    calendarEventCount +
    contentItemCount +
    submissionCount;
  if (total > 0) {
    return {
      error: `Can't delete — this account has ${assignmentCount} lecturer assignment(s), ${registrationCount} registration(s), ${enrollmentCount} enrollment(s), ${announcementCount} announcement(s), ${calendarEventCount} calendar event(s), ${contentItemCount} content item(s), and ${submissionCount} submission(s) linked to it. Deactivate it instead.`,
    };
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}
