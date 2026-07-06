"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
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
  const admin = await requireRole(["SUPER_ADMIN", "ADMIN"]);

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
    include: { registration: { include: { student: true } } },
  });

  const template =
    parsed.data.decision === "VERIFIED"
      ? paymentVerifiedTemplate({ firstName: payment.registration.student.firstName })
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
  return undefined;
}

export async function approveRegistration(registrationId: string): Promise<ActionState> {
  const admin = await requireRole(["SUPER_ADMIN", "ADMIN"]);

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
  return undefined;
}

export async function rejectRegistration(
  registrationId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireRole(["SUPER_ADMIN", "ADMIN"]);

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
  return undefined;
}
