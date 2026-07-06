"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { userSchema, updateUserSchema } from "@/lib/validation/user.schema";
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

  const parsed = userSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  // Random placeholder password — never disclosed. The user sets a real one via the token link below.
  const passwordHash = await hashPassword(generateToken());

  let userId: string;
  try {
    const user = await prisma.user.create({
      data: { ...parsed.data, passwordHash },
    });
    userId = user.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A user with this email already exists." };
    }
    throw error;
  }

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
