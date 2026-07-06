"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/tokens";
import { sendNotificationEmail } from "@/lib/notifications";
import { passwordResetTemplate } from "@/lib/notifications/templates/account";
import type { ActionState } from "@/lib/actions/action-state";

const emailSchema = z.object({ email: z.email({ error: "Enter a valid email address." }) });

export type RequestResetState = { submitted?: boolean; error?: string } | undefined;

export async function requestPasswordReset(
  _prev: RequestResetState,
  formData: FormData
): Promise<RequestResetState> {
  const parsed = emailSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Enter a valid email address." };
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Always behave the same regardless of whether the account exists, to avoid leaking registered emails.
  if (user && user.isActive) {
    const token = generateToken();
    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
    });
    const resetUrl = `${process.env.AUTH_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;
    const template = passwordResetTemplate({ firstName: user.firstName, resetUrl });
    await sendNotificationEmail("PASSWORD_RESET_REQUESTED", { to: user.email, ...template }, user.id);
  }

  return { submitted: true };
}

const completeResetSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, { error: "Password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function completePasswordReset(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = completeResetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token: parsed.data.token },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return { error: "This link is invalid or has expired. Request a new one." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ]);

  redirect("/login");
}
