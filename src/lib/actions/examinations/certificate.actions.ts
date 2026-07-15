"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { storage } from "@/lib/storage";
import { generateCertificatePdf } from "@/lib/certificates/generate";
import { Prisma } from "@/generated/prisma/client";
import type { ActionState } from "@/lib/actions/action-state";

export async function issueCertificate(
  studentId: string,
  moduleId: string,
  _prev: ActionState,
  _formData: FormData
): Promise<ActionState> {
  const examUnit = await requireRole(["EXAMINATION_UNIT"]);

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_moduleId: { studentId, moduleId } },
  });
  if (!enrollment) {
    return { error: "This student is not enrolled in this module." };
  }

  const [student, module_] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: studentId } }),
    prisma.module.findUniqueOrThrow({
      where: { id: moduleId },
      include: { program: true, academicYear: true, semester: true },
    }),
  ]);

  const verificationCode = randomBytes(10).toString("hex").toUpperCase();
  const issuedAt = new Date();

  const pdfBuffer = await generateCertificatePdf({
    studentName: `${student.firstName} ${student.lastName}`,
    moduleTitle: module_.title,
    moduleCode: module_.code,
    programName: module_.program.name,
    academicYearName: module_.academicYear.name,
    semesterName: module_.semester.name,
    issuedAt,
    verificationCode,
    issuedByName: examUnit.name ?? examUnit.email ?? "Examination Unit",
  });

  const uploaded = await storage.uploadBuffer({
    folder: "certificates",
    filename: `${studentId}-${moduleId}.pdf`,
    buffer: pdfBuffer,
    contentType: "application/pdf",
  });

  try {
    await prisma.$transaction([
      prisma.certificate.create({
        data: {
          studentId,
          moduleId,
          verificationCode,
          fileUrl: uploaded.url,
          issuedById: examUnit.id,
          issuedAt,
        },
      }),
      prisma.enrollment.update({
        where: { studentId_moduleId: { studentId, moduleId } },
        data: { status: "COMPLETED" },
      }),
    ]);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { error: "A certificate has already been issued for this student and module." };
    }
    throw error;
  }

  revalidatePath(`/examinations/certificates/${studentId}`);
  revalidatePath("/examinations/certificates");
  revalidatePath("/examinations");
  revalidatePath("/student/certificates");
  return undefined;
}
