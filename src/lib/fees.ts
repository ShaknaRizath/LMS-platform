import "server-only";
import { prisma } from "@/lib/db/prisma";

/** A program's fee for a given curriculum year + semester number, or null if not set yet. */
export async function getProgramCurriculumFee(programId: string, yearLevel: number, semesterNumber: number) {
  const fee = await prisma.programCurriculumFee.findUnique({
    where: { programId_yearLevel_semesterNumber: { programId, yearLevel, semesterNumber } },
  });
  return fee?.amount ?? null;
}

/**
 * getProgramCurriculumFee, net of the student's most-recently-approved Scholarship (if any).
 * Only for single-student lookups — a bulk/reporting caller looping over many students should
 * fetch all APPROVED scholarships in one query instead of calling this per row (see
 * getOutstandingBalances in src/lib/finance/reports.ts for that pattern).
 */
export async function getEffectiveFee(
  studentId: string,
  programId: string,
  yearLevel: number,
  semesterNumber: number
): Promise<number | null> {
  const fee = await getProgramCurriculumFee(programId, yearLevel, semesterNumber);
  if (fee === null) return null;

  const scholarship = await prisma.scholarship.findFirst({
    where: { studentId, status: "APPROVED" },
    orderBy: { decidedAt: "desc" },
  });
  if (!scholarship || scholarship.discountType === null || scholarship.discountValue === null) {
    return Number(fee);
  }

  const discount =
    scholarship.discountType === "PERCENTAGE"
      ? (Number(fee) * Number(scholarship.discountValue)) / 100
      : Number(scholarship.discountValue);
  return Math.max(0, Number(fee) - discount);
}
