"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertOwnRegistration } from "@/lib/auth/ownership";
import { getEffectiveFee } from "@/lib/fees";
import { sendNotificationEmail, getPaymentReviewers } from "@/lib/notifications";
import {
  paymentVerifiedTemplate,
  gatewayPaymentReceivedTemplate,
} from "@/lib/notifications/templates/registration";
import type { ActionState } from "@/lib/actions/action-state";

/** Creates a pending gateway payment record and sends the student to the (mock) checkout page. */
export async function initiateGatewayPayment(
  registrationId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const student = await requireRole(["STUDENT"]);
  await assertOwnRegistration(registrationId, student.id);

  const registration = await prisma.semesterRegistration.findUniqueOrThrow({
    where: { id: registrationId },
    include: { semester: true, student: true },
  });
  if (registration.status !== "PAYMENT_PENDING") {
    return { error: "This registration is not awaiting payment." };
  }

  const fee = registration.student.programId
    ? await getEffectiveFee(student.id, registration.student.programId, registration.yearLevel, registration.semester.semesterNumber)
    : null;
  if (fee === null) {
    return { error: "No fee has been set for your program this semester yet. Contact your administrator." };
  }

  const payment = await prisma.paymentRecord.create({
    data: {
      registrationId,
      amount: fee,
      currency: "LKR",
      method: "GATEWAY",
      gatewayProvider: "MOCK",
      gatewayReference: `MOCK-${Date.now().toString(36).toUpperCase()}`,
    },
  });

  redirect(`/student/register/${registrationId}/payment/gateway/${payment.id}`);
}

/** Cancels an unpaid gateway checkout, discarding the pending payment record. */
export async function cancelGatewayPayment(paymentRecordId: string, registrationId: string) {
  const student = await requireRole(["STUDENT"]);
  await assertOwnRegistration(registrationId, student.id);

  await prisma.paymentRecord.deleteMany({
    where: { id: paymentRecordId, registrationId, method: "GATEWAY", verificationStatus: "PENDING" },
  });

  redirect(`/student/register/${registrationId}/payment`);
}

/** Simulates the gateway's success callback: marks the payment verified and moves the registration to review. */
export async function confirmGatewayPayment(paymentRecordId: string, registrationId: string) {
  const student = await requireRole(["STUDENT"]);
  await assertOwnRegistration(registrationId, student.id);

  const payment = await prisma.paymentRecord.findUniqueOrThrow({
    where: { id: paymentRecordId },
    include: {
      registration: { include: { student: true, semester: { include: { academicYear: true } } } },
    },
  });
  if (payment.registrationId !== registrationId || payment.method !== "GATEWAY") {
    throw new Error("This payment does not belong to this registration.");
  }

  if (payment.verificationStatus === "PENDING") {
    await prisma.$transaction([
      prisma.paymentRecord.update({
        where: { id: paymentRecordId },
        data: { verificationStatus: "VERIFIED", verifiedAt: new Date() },
      }),
      prisma.semesterRegistration.update({
        where: { id: registrationId },
        data: { status: "PENDING" },
      }),
    ]);

    const studentTemplate = paymentVerifiedTemplate({ firstName: payment.registration.student.firstName });
    await sendNotificationEmail(
      "PAYMENT_VERIFIED",
      { to: payment.registration.student.email, ...studentTemplate },
      payment.registration.studentId
    );

    const reviewers = await getPaymentReviewers();
    const reviewerTemplate = gatewayPaymentReceivedTemplate({
      studentName: `${payment.registration.student.firstName} ${payment.registration.student.lastName}`,
      semesterLabel: `${payment.registration.semester.academicYear.name} — ${payment.registration.semester.name}`,
      amount: payment.amount.toString(),
      currency: payment.currency,
    });
    await Promise.all(
      reviewers.map((reviewer) =>
        sendNotificationEmail(
          "GATEWAY_PAYMENT_RECEIVED",
          { to: reviewer.email, ...reviewerTemplate },
          reviewer.id
        )
      )
    );
  }

  revalidatePath(`/student/registrations/${registrationId}`);
  revalidatePath("/admin/registrations");
  revalidatePath("/finance/registrations");
  redirect(`/student/registrations/${registrationId}`);
}
