"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { programSchema } from "@/lib/validation/program.schema";
import { programCurriculumFeeSchema } from "@/lib/validation/program-fee.schema";
import type { ActionState } from "@/lib/actions/action-state";

export async function createProgram(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = programSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  let programId: string;
  try {
    const program = await prisma.program.create({ data: parsed.data });
    programId = program.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A program with this code already exists." };
    }
    throw error;
  }

  revalidatePath("/admin/programs");
  redirect(`/admin/programs/${programId}`);
}

export async function updateProgram(
  programId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = programSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await prisma.program.update({ where: { id: programId }, data: parsed.data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A program with this code already exists." };
    }
    throw error;
  }

  revalidatePath("/admin/programs");
  revalidatePath(`/admin/programs/${programId}`);
  redirect(`/admin/programs/${programId}`);
}

export async function toggleProgramActive(programId: string, isActive: boolean) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.program.update({ where: { id: programId }, data: { isActive } });
  revalidatePath("/admin/programs");
  revalidatePath(`/admin/programs/${programId}`);
}

export async function deleteProgram(
  programId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  // Cascades: modules and everything under them (lecturer assignments, enrollments,
  // registrations, payment records, announcements, content/submissions) are deleted
  // with this program (see schema.prisma onDelete: Cascade). Students keep their
  // accounts — their programId is just cleared (onDelete: SetNull), not the account itself.
  await prisma.program.delete({ where: { id: programId } });
  revalidatePath("/admin/programs");
  redirect("/admin/programs");
}

export async function setProgramCurriculumFee(
  programId: string,
  yearLevel: number,
  semesterNumber: number,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = programCurriculumFeeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.programCurriculumFee.upsert({
    where: { programId_yearLevel_semesterNumber: { programId, yearLevel, semesterNumber } },
    update: { amount: parsed.data.amount },
    create: { programId, yearLevel, semesterNumber, amount: parsed.data.amount },
  });

  revalidatePath(`/admin/programs/${programId}`);
  return undefined;
}
