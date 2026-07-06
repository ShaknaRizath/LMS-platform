"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertOwnRegistration } from "@/lib/auth/ownership";
import { paymentSchema } from "@/lib/validation/payment.schema";
import type { ActionState } from "@/lib/actions/action-state";

export async function uploadPaymentReceipt(
  registrationId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const student = await requireRole(["STUDENT"]);
  await assertOwnRegistration(registrationId, student.id);

  const registration = await prisma.semesterRegistration.findUniqueOrThrow({
    where: { id: registrationId },
  });
  if (registration.status !== "PAYMENT_PENDING") {
    return { error: "This registration is not awaiting payment." };
  }

  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.$transaction([
    prisma.paymentRecord.create({ data: { ...parsed.data, registrationId } }),
    prisma.semesterRegistration.update({ where: { id: registrationId }, data: { status: "PENDING" } }),
  ]);

  revalidatePath(`/student/registrations/${registrationId}`);
  redirect(`/student/registrations/${registrationId}`);
}
