"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";

const LOCK_ROLES = ["EXAMINATION_UNIT", "SUPER_ADMIN", "CAMPUS_ADMIN"] as const;

function revalidateLockSurfaces(moduleId: string) {
  revalidatePath("/examinations/marks");
  revalidatePath(`/lecturer/modules/${moduleId}/assignments`);
  revalidatePath(`/lecturer/modules/${moduleId}/quizzes`);
}

export async function lockModuleGrades(moduleId: string) {
  const user = await requireRole([...LOCK_ROLES]);

  await prisma.moduleGradeLock.upsert({
    where: { moduleId },
    update: { lockedAt: new Date(), lockedById: user.id, unlockedAt: null, unlockedById: null },
    create: { moduleId, lockedById: user.id },
  });

  revalidateLockSurfaces(moduleId);
}

export async function unlockModuleGrades(moduleId: string) {
  const user = await requireRole([...LOCK_ROLES]);

  await prisma.moduleGradeLock.update({
    where: { moduleId },
    data: { unlockedAt: new Date(), unlockedById: user.id },
  });

  revalidateLockSurfaces(moduleId);
}
