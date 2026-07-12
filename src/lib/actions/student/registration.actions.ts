"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertOwnRegistration } from "@/lib/auth/ownership";
import { registrationSchema } from "@/lib/validation/registration.schema";
import type { ActionState } from "@/lib/actions/action-state";

export async function createRegistration(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const student = await requireRole(["STUDENT"]);
  if (!student.programId) {
    return { error: "No program is assigned to your account." };
  }

  const parsed = registrationSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const activeAcademicYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  if (!activeAcademicYear) {
    return { error: "No active academic year is set up yet." };
  }

  const semester = await prisma.semester.findUnique({
    where: {
      academicYearId_semesterNumber: {
        academicYearId: activeAcademicYear.id,
        semesterNumber: parsed.data.semesterNumber,
      },
    },
  });
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
      programId: student.programId,
      semesterId: semester.id,
      yearLevel: parsed.data.yearLevel,
      isActive: true,
    },
  });
  if (modules.length === 0) {
    return { error: "No modules are available yet for this year and semester." };
  }

  const registration = await prisma.semesterRegistration.create({
    data: {
      studentId: student.id,
      semesterId: semester.id,
      yearLevel: parsed.data.yearLevel,
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
  _formData: FormData
): Promise<ActionState> {
  const student = await requireRole(["STUDENT"]);
  await assertOwnRegistration(registrationId, student.id);

  const registration = await prisma.semesterRegistration.findUniqueOrThrow({
    where: { id: registrationId },
  });
  if (registration.status !== "REJECTED") {
    return { error: "Only rejected registrations can be resubmitted." };
  }

  // Modules are re-derived the same way as at creation time — a rejected registration's year
  // level and semester don't change on resubmit, only whichever modules are currently active
  // for that combination (in case the admin added/removed modules since the rejection).
  const modules = await prisma.module.findMany({
    where: {
      programId: student.programId ?? undefined,
      semesterId: registration.semesterId,
      yearLevel: registration.yearLevel,
      isActive: true,
    },
  });
  if (modules.length === 0) {
    return { error: "No modules are currently available for this year and semester." };
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
