"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { storage } from "@/lib/storage";
import { generateInvoicePdf } from "@/lib/finance/generate";
import {
  verifyPaymentSchema,
  rejectRegistrationSchema,
} from "@/lib/validation/payment-verification.schema";
import { sendNotificationEmail } from "@/lib/notifications";
import {
  registrationApprovedTemplate,
  registrationRejectedTemplate,
  paymentVerifiedTemplate,
  paymentRejectedTemplate,
} from "@/lib/notifications/templates/registration";
import type { ActionState } from "@/lib/actions/action-state";

export async function verifyPayment(
  paymentRecordId: string,
  registrationId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole(["SUPER_ADMIN", "CAMPUS_ADMIN", "FINANCE"]);

  const parsed = verifyPaymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const payment = await prisma.paymentRecord.update({
    where: { id: paymentRecordId },
    data: {
      verificationStatus: parsed.data.decision,
      verifiedById: admin.id,
      verifiedAt: new Date(),
      verificationNotes: parsed.data.notes,
    },
    include: {
      registration: { include: { student: { include: { program: true } }, semester: true } },
    },
  });

  let invoiceUrl: string | undefined;

  if (parsed.data.decision === "VERIFIED") {
    const { student, semester } = payment.registration;
    const fee = student.programId
      ? await prisma.programCurriculumFee.findUnique({
          where: {
            programId_yearLevel_semesterNumber: {
              programId: student.programId,
              yearLevel: payment.registration.yearLevel,
              semesterNumber: semester.semesterNumber,
            },
          },
        })
      : null;

    const invoiceNumber = `INV-${randomBytes(6).toString("hex").toUpperCase()}`;
    const pdfBuffer = await generateInvoicePdf({
      invoiceNumber,
      issuedAt: new Date(),
      studentName: `${student.firstName} ${student.lastName}`,
      programName: student.program?.name ?? "—",
      semesterLabel: semester.name,
      description: fee ? `${semester.name} tuition fee` : "Payment received",
      amount: Number(payment.amount),
      currency: payment.currency,
      method: payment.method,
      verifiedAt: payment.verifiedAt ?? new Date(),
    });
    const uploaded = await storage.uploadBuffer({
      folder: "invoices",
      filename: `${payment.id}.pdf`,
      buffer: pdfBuffer,
      contentType: "application/pdf",
    });

    await prisma.invoice.create({
      data: { paymentRecordId: payment.id, invoiceNumber, pdfUrl: uploaded.url },
    });
    invoiceUrl = uploaded.url;
  }

  const template =
    parsed.data.decision === "VERIFIED"
      ? paymentVerifiedTemplate({ firstName: payment.registration.student.firstName, invoiceUrl })
      : paymentRejectedTemplate({
          firstName: payment.registration.student.firstName,
          reason: parsed.data.notes ?? "",
        });

  await sendNotificationEmail(
    parsed.data.decision === "VERIFIED" ? "PAYMENT_VERIFIED" : "PAYMENT_REJECTED",
    { to: payment.registration.student.email, ...template },
    payment.registration.studentId
  );

  revalidatePath(`/admin/registrations/${registrationId}`);
  revalidatePath(`/finance/registrations/${registrationId}`);
  revalidatePath("/student/payments");
  return undefined;
}

export async function approveRegistration(registrationId: string): Promise<ActionState> {
  const admin = await requireRole(["SUPER_ADMIN", "CAMPUS_ADMIN", "FINANCE"]);

  const registration = await prisma.semesterRegistration.findUnique({
    where: { id: registrationId },
    include: { paymentRecords: true, registrationModules: true, student: true },
  });
  if (!registration) return { error: "Registration not found." };
  if (registration.status !== "PENDING") {
    return { error: "Only registrations pending approval can be approved." };
  }

  const hasVerifiedPayment = registration.paymentRecords.some(
    (payment) => payment.verificationStatus === "VERIFIED"
  );
  if (!hasVerifiedPayment) {
    return { error: "Verify the payment before approving this registration." };
  }

  await prisma.$transaction([
    prisma.semesterRegistration.update({
      where: { id: registrationId },
      data: { status: "APPROVED", decidedById: admin.id, decidedAt: new Date() },
    }),
    prisma.enrollment.createMany({
      data: registration.registrationModules.map((rm) => ({
        studentId: registration.studentId,
        moduleId: rm.moduleId,
        registrationId,
      })),
      skipDuplicates: true,
    }),
  ]);

  const template = registrationApprovedTemplate({ firstName: registration.student.firstName });
  await sendNotificationEmail(
    "REGISTRATION_APPROVED",
    { to: registration.student.email, ...template },
    registration.studentId
  );

  revalidatePath(`/admin/registrations/${registrationId}`);
  revalidatePath("/admin/registrations");
  revalidatePath(`/finance/registrations/${registrationId}`);
  revalidatePath("/finance/registrations");
  return undefined;
}

export async function rejectRegistration(
  registrationId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole(["SUPER_ADMIN", "CAMPUS_ADMIN", "FINANCE"]);

  const parsed = rejectRegistrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const registration = await prisma.semesterRegistration.findUnique({
    where: { id: registrationId },
    include: { student: true },
  });
  if (!registration) return { error: "Registration not found." };
  if (registration.status !== "PENDING") {
    return { error: "Only registrations pending approval can be rejected." };
  }

  await prisma.semesterRegistration.update({
    where: { id: registrationId },
    data: {
      status: "REJECTED",
      decidedById: admin.id,
      decidedAt: new Date(),
      rejectionReason: parsed.data.reason,
    },
  });

  const template = registrationRejectedTemplate({
    firstName: registration.student.firstName,
    reason: parsed.data.reason,
  });
  await sendNotificationEmail(
    "REGISTRATION_REJECTED",
    { to: registration.student.email, ...template },
    registration.studentId
  );

  revalidatePath(`/admin/registrations/${registrationId}`);
  revalidatePath("/admin/registrations");
  revalidatePath(`/finance/registrations/${registrationId}`);
  revalidatePath("/finance/registrations");
  return undefined;
}
