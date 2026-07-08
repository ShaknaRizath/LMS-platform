"use server";

import { z } from "zod";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signupSchema } from "@/lib/validation/signup.schema";
import { sendNotificationEmail } from "@/lib/notifications";
import { signupWelcomeTemplate } from "@/lib/notifications/templates/account";
import type { ActionState } from "@/lib/actions/action-state";

export async function signup(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { name, email, password, programId } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const program = await prisma.program.findUnique({ where: { id: programId } });
  if (!program || !program.isActive) {
    return { error: "Selected program could not be found." };
  }

  const [firstName, ...rest] = name.trim().split(/\s+/);
  const lastName = rest.join(" ") || "-";

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: firstName || name,
      lastName,
      role: "STUDENT",
      isActive: true,
      programId,
    },
  });

  const template = signupWelcomeTemplate({ firstName: user.firstName });
  await sendNotificationEmail("SIGNUP_WELCOME", { to: user.email, ...template }, user.id);

  try {
    await signIn("credentials", { email, password, redirectTo: "/student" });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Account created — please sign in." };
    }
    throw error;
  }
}
