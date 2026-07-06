"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertOwnRegistration } from "@/lib/auth/ownership";
import { registrationSchema, resubmitRegistrationSchema } from "@/lib/validation/registration.schema";
import type { ActionState } from "@/lib/actions/action-state";

export async function createRegistration(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const student = await requireRole(["STUDENT"]);

  const parsed = registrationSchema.safeParse({
    semesterId: formData.get("semesterId"),
    moduleIds: formData.getAll("moduleIds"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const semester = await prisma.semester.findUnique({ where: { id: parsed.data.semesterId } });
  if (!semester || semester.status !== "ACTIVE") {
    return { error: "Registration is not currently open for this semester." };
  }

  const now = new Date();
  if (semester.registrationOpensAt && now < semester.registrationOpensAt) {
    return { error: "Registration has not opened yet for this semester." };
  }
  if (semester.registrationClosesAt && now > semester.registrationClosesAt) {
    return { error: "Registration has closed for this semester." };
  }

  const existing = await prisma.semesterRegistration.findUnique({
    where: { studentId_semesterId: { studentId: student.id, semesterId: semester.id } },
  });
  if (existing) {
    return { error: "You have already registered for this semester." };
  }

  const modules = await prisma.module.findMany({
    where: {
      id: { in: parsed.data.moduleIds },
      semesterId: semester.id,
      programId: student.programId ?? undefined,
      isActive: true,
    },
  });
  if (modules.length !== parsed.data.moduleIds.length) {
    return { error: "One or more selected modules are not available for you in this semester." };
  }

  const registration = await prisma.semesterRegistration.create({
    data: {
      studentId: student.id,
      semesterId: semester.id,
      status: "PAYMENT_PENDING",
      submittedAt: new Date(),
      registrationModules: { createMany: { data: modules.map((m) => ({ moduleId: m.id })) } },
    },
  });

  revalidatePath("/student/registrations");
  redirect(`/student/register/${registration.id}/payment`);
}

export async function resubmitRegistration(
  registrationId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const student = await requireRole(["STUDENT"]);
  await assertOwnRegistration(registrationId, student.id);

  const registration = await prisma.semesterRegistration.findUniqueOrThrow({
    where: { id: registrationId },
  });
  if (registration.status !== "REJECTED") {
    return { error: "Only rejected registrations can be resubmitted." };
  }

  const parsed = resubmitRegistrationSchema.safeParse({ moduleIds: formData.getAll("moduleIds") });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const modules = await prisma.module.findMany({
    where: {
      id: { in: parsed.data.moduleIds },
      semesterId: registration.semesterId,
      programId: student.programId ?? undefined,
      isActive: true,
    },
  });
  if (modules.length !== parsed.data.moduleIds.length) {
    return { error: "One or more selected modules are not available for you in this semester." };
  }

  await prisma.$transaction([
    prisma.registrationModule.deleteMany({ where: { registrationId } }),
    prisma.registrationModule.createMany({
      data: modules.map((m) => ({ registrationId, moduleId: m.id })),
    }),
    prisma.semesterRegistration.update({
      where: { id: registrationId },
      data: { status: "PAYMENT_PENDING", rejectionReason: null, submittedAt: new Date() },
    }),
  ]);

  revalidatePath(`/student/registrations/${registrationId}`);
  redirect(`/student/register/${registrationId}/payment`);
}
