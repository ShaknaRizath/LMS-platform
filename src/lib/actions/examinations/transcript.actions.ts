"use server";

import { revalidatePath } from "next/cache";
import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { storage } from "@/lib/storage";
import { computeStudentAcademicRecord } from "@/lib/grades/gpa";
import { generateTranscriptPdf } from "@/lib/transcripts/generate";

// Registration numbers are assigned lazily on first transcript issuance, not at admission —
// existing (pre-batch) students only need one once someone actually requests their transcript.
async function ensureRegistrationNumber(studentId: string): Promise<string> {
  return prisma.$transaction(async (tx) => {
    const student = await tx.user.findUniqueOrThrow({ where: { id: studentId } });
    if (student.registrationNumber) return student.registrationNumber;

    const count = await tx.user.count({ where: { registrationNumber: { not: null } } });
    const registrationNumber = `CIMS/${new Date().getFullYear()}/${String(count + 1).padStart(5, "0")}`;
    await tx.user.update({ where: { id: studentId }, data: { registrationNumber } });
    return registrationNumber;
  });
}

export async function issueTranscript(studentId: string) {
  const examUnit = await requireRole(["EXAMINATION_UNIT"]);

  const registrationNumber = await ensureRegistrationNumber(studentId);
  const student = await prisma.user.findUniqueOrThrow({
    where: { id: studentId },
    include: { program: true },
  });
  const record = await computeStudentAcademicRecord(studentId);
  const verificationCode = randomBytes(10).toString("hex").toUpperCase();
  const issuedAt = new Date();

  const pdfBuffer = await generateTranscriptPdf({
    studentName: `${student.firstName} ${student.lastName}`,
    registrationNumber,
    programName: student.program?.name ?? "—",
    record,
    issuedAt,
    verificationCode,
    issuedByName: examUnit.name ?? examUnit.email ?? "Examination Unit",
  });

  const uploaded = await storage.uploadBuffer({
    folder: "transcripts",
    filename: `${studentId}-${Date.now()}.pdf`,
    buffer: pdfBuffer,
    contentType: "application/pdf",
  });

  await prisma.transcript.create({
    data: {
      studentId,
      verificationCode,
      cumulativeGpa: record.cumulativeGpa,
      fileUrl: uploaded.url,
      issuedById: examUnit.id,
      issuedAt,
    },
  });

  revalidatePath("/examinations/transcripts");
  revalidatePath(`/examinations/transcripts/${studentId}`);
  revalidatePath("/examinations");
  revalidatePath("/student/transcripts");
}
