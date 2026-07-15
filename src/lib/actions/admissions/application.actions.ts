"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { hashPassword } from "@/lib/auth/password";
import { generateToken } from "@/lib/auth/tokens";
import { storage } from "@/lib/storage";
import { generateOfferLetterPdf } from "@/lib/admissions/generate";
import { applicationSchema, rejectApplicationSchema } from "@/lib/validation/application.schema";
import { sendNotificationEmail } from "@/lib/notifications";
import {
  applicationReceivedTemplate,
  offerLetterTemplate,
  applicationRejectedTemplate,
} from "@/lib/notifications/templates/account";
import type { ActionState } from "@/lib/actions/action-state";
import type { Role } from "@/generated/prisma/client";

const REVIEW_ROLES: Role[] = ["SUPER_ADMIN", "CAMPUS_ADMIN", "MARKETING_OFFICER"];

function baseUrl(): string {
  return process.env.AUTH_URL ?? "http://localhost:3000";
}

export async function submitApplication(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = applicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const program = await prisma.program.findUnique({ where: { id: parsed.data.programId } });
  if (!program || !program.isActive) {
    return { error: "Selected program could not be found." };
  }

  const referenceCode = randomBytes(6).toString("hex").toUpperCase();

  await prisma.application.create({
    data: { ...parsed.data, referenceCode },
  });

  const statusUrl = `${baseUrl()}/apply/status?ref=${referenceCode}`;
  const template = applicationReceivedTemplate({
    firstName: parsed.data.firstName,
    referenceCode,
    statusUrl,
  });
  await sendNotificationEmail("APPLICATION_RECEIVED", { to: parsed.data.email, ...template });

  redirect(`/apply/status?ref=${referenceCode}`);
}

export async function approveApplication(
  applicationId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const reviewer = await requireRole(REVIEW_ROLES);

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { program: true },
  });
  if (!application) return { error: "Application not found." };
  if (application.status !== "PENDING") {
    return { error: "Only applications pending review can be approved." };
  }

  const admissionDate = new Date();
  const pdfBuffer = await generateOfferLetterPdf({
    applicantName: `${application.firstName} ${application.lastName}`,
    programName: application.program.name,
    admissionDate,
    referenceCode: application.referenceCode,
  });
  const uploaded = await storage.uploadBuffer({
    folder: "offer-letters",
    filename: `${application.id}.pdf`,
    buffer: pdfBuffer,
    contentType: "application/pdf",
  });

  const { userId, token } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: application.email,
        passwordHash: await hashPassword(generateToken()),
        firstName: application.firstName,
        lastName: application.lastName,
        phone: application.phone,
        role: "STUDENT",
        isActive: true,
        programId: application.programId,
      },
    });

    await tx.application.update({
      where: { id: applicationId },
      data: {
        status: "APPROVED",
        reviewedById: reviewer.id,
        reviewedAt: admissionDate,
        createdUserId: user.id,
        offerLetterUrl: uploaded.url,
      },
    });

    const resetToken = generateToken();
    await tx.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { userId: user.id, token: resetToken };
  });

  const setPasswordUrl = `${baseUrl()}/reset-password?token=${token}`;
  const template = offerLetterTemplate({
    firstName: application.firstName,
    programName: application.program.name,
    setPasswordUrl,
    offerLetterUrl: uploaded.url,
  });
  await sendNotificationEmail("APPLICATION_APPROVED", { to: application.email, ...template }, userId);

  revalidatePath("/marketing/applications");
  revalidatePath("/admin/applications");
  revalidatePath("/marketing");
  revalidatePath("/admin");
  return undefined;
}

export async function rejectApplication(
  applicationId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const reviewer = await requireRole(REVIEW_ROLES);

  const parsed = rejectApplicationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const application = await prisma.application.findUnique({ where: { id: applicationId } });
  if (!application) return { error: "Application not found." };
  if (application.status !== "PENDING") {
    return { error: "Only applications pending review can be rejected." };
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: "REJECTED",
      reviewedById: reviewer.id,
      reviewedAt: new Date(),
      rejectionReason: parsed.data.reason,
    },
  });

  const template = applicationRejectedTemplate({
    firstName: application.firstName,
    reason: parsed.data.reason,
  });
  await sendNotificationEmail("APPLICATION_REJECTED", { to: application.email, ...template });

  revalidatePath("/marketing/applications");
  revalidatePath("/admin/applications");
  revalidatePath("/marketing");
  revalidatePath("/admin");
  return undefined;
}
