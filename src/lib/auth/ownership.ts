import "server-only";
import { prisma } from "@/lib/db/prisma";

/** Throws unless the given lecturer is assigned to the given module. Role alone doesn't prove ownership. */
export async function assertLecturerOwnsModule(moduleId: string, lecturerId: string) {
  const assignment = await prisma.lecturerModuleAssignment.findUnique({
    where: { lecturerId_moduleId: { lecturerId, moduleId } },
  });
  if (!assignment) {
    throw new Error("You are not assigned to this module.");
  }
}

/** Throws unless the given student owns the given semester registration. */
export async function assertOwnRegistration(registrationId: string, studentId: string) {
  const registration = await prisma.semesterRegistration.findUnique({
    where: { id: registrationId },
    select: { studentId: true },
  });
  if (!registration || registration.studentId !== studentId) {
    throw new Error("This registration does not belong to you.");
  }
}
