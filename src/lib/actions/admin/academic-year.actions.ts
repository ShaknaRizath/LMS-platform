"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import type { SemesterStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { academicYearSchema, semesterSchema } from "@/lib/validation/academic-year.schema";
import type { ActionState } from "@/lib/actions/action-state";

export async function createAcademicYear(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = academicYearSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  let academicYearId: string;
  try {
    const academicYear = await prisma.academicYear.create({ data: parsed.data });
    academicYearId = academicYear.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "An academic year with this name already exists." };
    }
    throw error;
  }

  revalidatePath("/admin/academic-years");
  redirect(`/admin/academic-years/${academicYearId}`);
}

export async function setActiveAcademicYear(academicYearId: string) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  await prisma.$transaction([
    prisma.academicYear.updateMany({ data: { isActive: false } }),
    prisma.academicYear.update({ where: { id: academicYearId }, data: { isActive: true } }),
  ]);

  revalidatePath("/admin/academic-years");
}

export async function createSemester(
  academicYearId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = semesterSchema.safeParse({
    ...Object.fromEntries(formData),
    academicYearId,
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await prisma.semester.create({ data: parsed.data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A semester with this number already exists for this academic year." };
    }
    throw error;
  }

  revalidatePath(`/admin/academic-years/${academicYearId}`);
  return undefined;
}

export async function setSemesterStatus(
  semesterId: string,
  academicYearId: string,
  status: SemesterStatus
) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.semester.update({ where: { id: semesterId }, data: { status } });
  revalidatePath(`/admin/academic-years/${academicYearId}`);
}
