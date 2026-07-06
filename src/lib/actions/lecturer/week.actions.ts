"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertLecturerOwnsModule } from "@/lib/auth/ownership";
import { weekSchema } from "@/lib/validation/week.schema";
import type { ActionState } from "@/lib/actions/action-state";

export async function createWeek(
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  const parsed = weekSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const lastWeek = await prisma.moduleWeek.findFirst({
    where: { moduleId },
    orderBy: { orderIndex: "desc" },
  });

  try {
    await prisma.moduleWeek.create({
      data: { ...parsed.data, moduleId, orderIndex: (lastWeek?.orderIndex ?? -1) + 1 },
    });
  } catch {
    return { error: "A week with this number already exists for this module." };
  }

  revalidatePath(`/lecturer/modules/${moduleId}`);
  return undefined;
}

export async function deleteWeek(weekId: string, moduleId: string) {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  await prisma.moduleWeek.delete({ where: { id: weekId } });

  revalidatePath(`/lecturer/modules/${moduleId}`);
}

export async function reorderWeeks(moduleId: string, orderedWeekIds: string[]) {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  await prisma.$transaction(
    orderedWeekIds.map((id, index) =>
      prisma.moduleWeek.update({ where: { id }, data: { orderIndex: index } })
    )
  );

  revalidatePath(`/lecturer/modules/${moduleId}`);
}
