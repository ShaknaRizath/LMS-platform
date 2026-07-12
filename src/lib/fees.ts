import "server-only";
import { prisma } from "@/lib/db/prisma";

/** A program's fee for a given curriculum year + semester number, or null if not set yet. */
export async function getProgramCurriculumFee(programId: string, yearLevel: number, semesterNumber: number) {
  const fee = await prisma.programCurriculumFee.findUnique({
    where: { programId_yearLevel_semesterNumber: { programId, yearLevel, semesterNumber } },
  });
  return fee?.amount ?? null;
}
