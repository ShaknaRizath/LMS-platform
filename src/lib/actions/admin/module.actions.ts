"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { moduleSchema } from "@/lib/validation/module.schema";
import type { ActionState } from "@/lib/actions/action-state";

async function resolveAcademicYearId(semesterId: string) {
  const semester = await prisma.semester.findUnique({
    where: { id: semesterId },
    select: { academicYearId: true },
  });
  return semester?.academicYearId;
}

export async function createModule(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = moduleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const academicYearId = await resolveAcademicYearId(parsed.data.semesterId);
  if (!academicYearId) {
    return { error: "Selected semester could not be found." };
  }

  let moduleId: string;
  try {
    const module_ = await prisma.module.create({
      data: { ...parsed.data, academicYearId },
    });
    moduleId = module_.id;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A module with this code already exists for that semester." };
    }
    throw error;
  }

  revalidatePath("/admin/modules");
  redirect(`/admin/modules/${moduleId}`);
}

export async function updateModule(
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const parsed = moduleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const academicYearId = await resolveAcademicYearId(parsed.data.semesterId);
  if (!academicYearId) {
    return { error: "Selected semester could not be found." };
  }

  try {
    await prisma.module.update({
      where: { id: moduleId },
      data: { ...parsed.data, academicYearId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A module with this code already exists for that semester." };
    }
    throw error;
  }

  revalidatePath("/admin/modules");
  revalidatePath(`/admin/modules/${moduleId}`);
  redirect(`/admin/modules/${moduleId}`);
}

export async function toggleModuleActive(moduleId: string, isActive: boolean) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);
  await prisma.module.update({ where: { id: moduleId }, data: { isActive } });
  revalidatePath("/admin/modules");
  revalidatePath(`/admin/modules/${moduleId}`);
}

export async function deleteModule(
  moduleId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const [assignmentCount, enrollmentCount, registrationModuleCount] = await Promise.all([
    prisma.lecturerModuleAssignment.count({ where: { moduleId } }),
    prisma.enrollment.count({ where: { moduleId } }),
    prisma.registrationModule.count({ where: { moduleId } }),
  ]);
  if (assignmentCount > 0 || enrollmentCount > 0 || registrationModuleCount > 0) {
    return {
      error: `Can't delete — this module has ${assignmentCount} lecturer assignment(s), ${enrollmentCount} enrollment(s), and ${registrationModuleCount} registration(s) linked to it. Deactivate it instead.`,
    };
  }

  await prisma.module.delete({ where: { id: moduleId } });
  revalidatePath("/admin/modules");
  redirect("/admin/modules");
}

export async function assignLecturer(moduleId: string, lecturerId: string) {
  const admin = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  const lecturer = await prisma.user.findUnique({ where: { id: lecturerId } });
  if (!lecturer || lecturer.role !== "LECTURER" || !lecturer.isActive) {
    throw new Error("Selected user is not an active lecturer.");
  }

  await prisma.lecturerModuleAssignment.upsert({
    where: { lecturerId_moduleId: { lecturerId, moduleId } },
    update: {},
    create: { lecturerId, moduleId, assignedById: admin.id },
  });

  revalidatePath(`/admin/modules/${moduleId}`);
}

export async function unassignLecturer(moduleId: string, lecturerId: string) {
  await requireRole(["SUPER_ADMIN", "ADMIN"]);

  await prisma.lecturerModuleAssignment.delete({
    where: { lecturerId_moduleId: { lecturerId, moduleId } },
  });

  revalidatePath(`/admin/modules/${moduleId}`);
}
