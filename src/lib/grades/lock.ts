import "server-only";
import { prisma } from "@/lib/db/prisma";

/**
 * Returns a boolean rather than throwing — unlike ownership.ts's asserts (security
 * boundaries, rare, fine to crash to a generic error page), a lecturer hitting a locked
 * module is a normal, expected flow that deserves the same friendly inline `{ error }`
 * message every other business-rule rejection in these grading actions already gets.
 */
export async function isModuleGradesLocked(moduleId: string): Promise<boolean> {
  const lock = await prisma.moduleGradeLock.findUnique({ where: { moduleId } });
  return lock !== null && lock.unlockedAt === null;
}

export const MODULE_GRADES_LOCKED_MESSAGE =
  "Marks are locked for this module. Contact the Examination Unit to make changes.";
