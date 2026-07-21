import "server-only";
import { prisma } from "@/lib/db/prisma";

export type OutstandingBalanceRow = {
  registrationId: string;
  studentName: string;
  programName: string | null;
  semesterLabel: string;
  expected: number;
  paid: number;
  outstanding: number;
};

async function loadFeeMap() {
  const fees = await prisma.programCurriculumFee.findMany();
  const map = new Map<string, number>();
  for (const fee of fees) {
    map.set(`${fee.programId}-${fee.yearLevel}-${fee.semesterNumber}`, Number(fee.amount));
  }
  return map;
}

// One flat query for every APPROVED scholarship (not per-registration lookups), keeping only
// the most-recently-decided row per student — same "single bulk fetch, not N+1" discipline
// loadFeeMap already uses, so this function stays a fixed number of queries regardless of how
// many registrations exist (see getEffectiveFee in src/lib/fees.ts for the single-student
// equivalent of this same discount math).
async function loadScholarshipMap() {
  const scholarships = await prisma.scholarship.findMany({
    where: { status: "APPROVED" },
    orderBy: { decidedAt: "asc" },
  });
  const map = new Map<string, { discountType: string; discountValue: number }>();
  for (const scholarship of scholarships) {
    if (scholarship.discountType === null || scholarship.discountValue === null) continue;
    map.set(scholarship.studentId, {
      discountType: scholarship.discountType,
      discountValue: Number(scholarship.discountValue),
    });
  }
  return map;
}

function applyScholarshipDiscount(
  amount: number,
  scholarship: { discountType: string; discountValue: number } | undefined
): number {
  if (!scholarship) return amount;
  const discount =
    scholarship.discountType === "PERCENTAGE" ? (amount * scholarship.discountValue) / 100 : scholarship.discountValue;
  return Math.max(0, amount - discount);
}

/**
 * Resolves "expected" fee (net of any approved scholarship) vs. "paid" (verified payments) per
 * non-rejected registration. Flat queries only (registrations + curriculum fees + approved
 * scholarships), so this stays a fixed 3 queries regardless of how many registrations exist.
 */
export async function getOutstandingBalances(): Promise<{
  rows: OutstandingBalanceRow[];
  totalOutstanding: number;
}> {
  const [registrations, feeMap, scholarshipMap] = await Promise.all([
    prisma.semesterRegistration.findMany({
      where: { status: { not: "REJECTED" } },
      include: {
        student: { include: { program: true } },
        semester: true,
        paymentRecords: { where: { verificationStatus: "VERIFIED" }, select: { amount: true } },
      },
    }),
    loadFeeMap(),
    loadScholarshipMap(),
  ]);

  const rows: OutstandingBalanceRow[] = registrations.map((registration) => {
    const paid = registration.paymentRecords.reduce((sum, p) => sum + Number(p.amount), 0);
    const rawExpected = registration.student.programId
      ? (feeMap.get(
          `${registration.student.programId}-${registration.yearLevel}-${registration.semester.semesterNumber}`
        ) ?? 0)
      : 0;
    const expected = applyScholarshipDiscount(rawExpected, scholarshipMap.get(registration.studentId));
    return {
      registrationId: registration.id,
      studentName: `${registration.student.firstName} ${registration.student.lastName}`,
      programName: registration.student.program?.name ?? null,
      semesterLabel: registration.semester.name,
      expected,
      paid,
      outstanding: Math.max(0, expected - paid),
    };
  });

  const totalOutstanding = rows.reduce((sum, r) => sum + r.outstanding, 0);
  return { rows, totalOutstanding };
}

export function collectionRateFromRows(rows: OutstandingBalanceRow[]): {
  rate: number | null;
  totalExpected: number;
  totalPaid: number;
} {
  const totalExpected = rows.reduce((sum, r) => sum + r.expected, 0);
  const totalPaid = rows.reduce((sum, r) => sum + r.paid, 0);
  const rate = totalExpected > 0 ? (totalPaid / totalExpected) * 100 : null;
  return { rate, totalExpected, totalPaid };
}

export async function getCollectionRate() {
  const { rows } = await getOutstandingBalances();
  return collectionRateFromRows(rows);
}

export type DateRange = { from: Date; to: Date };

export async function getRevenueOverTime(range: DateRange): Promise<{ date: string; amount: number }[]> {
  const payments = await prisma.paymentRecord.findMany({
    where: { verificationStatus: "VERIFIED", verifiedAt: { gte: range.from, lte: range.to } },
    select: { amount: true, verifiedAt: true },
    orderBy: { verifiedAt: "asc" },
  });

  const byDay = new Map<string, number>();
  for (const payment of payments) {
    if (!payment.verifiedAt) continue;
    const key = payment.verifiedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    byDay.set(key, (byDay.get(key) ?? 0) + Number(payment.amount));
  }
  return Array.from(byDay.entries()).map(([date, amount]) => ({ date, amount }));
}

export type ProgramFeeStatusRow = {
  programId: string;
  code: string;
  name: string;
  durationYears: number;
  status: "Fee configured" | "Partially configured" | "Needs fee setup";
};

/**
 * "Fully configured" means a fee row exists for every (yearLevel, semesterNumber) combination
 * a program's duration actually spans — same distinct-semester-numbers-with-[1,2]-fallback
 * convention as the program detail page (src/app/finance/programs/[programId]/page.tsx), so the
 * two stay in agreement about what "complete" means.
 */
export async function getProgramFeeStatus(): Promise<ProgramFeeStatusRow[]> {
  const [programs, distinctSemesterNumbers, fees] = await Promise.all([
    prisma.program.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.semester.findMany({ select: { semesterNumber: true }, distinct: ["semesterNumber"] }),
    prisma.programCurriculumFee.findMany({ select: { programId: true } }),
  ]);
  const semesterCount = distinctSemesterNumbers.length > 0 ? distinctSemesterNumbers.length : 2;

  const feeCountByProgram = new Map<string, number>();
  for (const fee of fees) {
    feeCountByProgram.set(fee.programId, (feeCountByProgram.get(fee.programId) ?? 0) + 1);
  }

  return programs.map((program) => {
    const configuredCount = feeCountByProgram.get(program.id) ?? 0;
    const expectedCount = program.durationYears * semesterCount;
    const status: ProgramFeeStatusRow["status"] =
      configuredCount === 0 ? "Needs fee setup" : configuredCount < expectedCount ? "Partially configured" : "Fee configured";
    return {
      programId: program.id,
      code: program.code,
      name: program.name,
      durationYears: program.durationYears,
      status,
    };
  });
}

export async function getRevenueByProgram(): Promise<{ name: string; amount: number }[]> {
  const payments = await prisma.paymentRecord.findMany({
    where: { verificationStatus: "VERIFIED" },
    select: {
      amount: true,
      registration: { select: { student: { select: { program: { select: { id: true, name: true } } } } } },
    },
  });

  const byProgram = new Map<string, { name: string; amount: number }>();
  for (const payment of payments) {
    const program = payment.registration.student.program;
    const key = program?.id ?? "unassigned";
    const name = program?.name ?? "No program";
    const entry = byProgram.get(key) ?? { name, amount: 0 };
    entry.amount += Number(payment.amount);
    byProgram.set(key, entry);
  }

  return Array.from(byProgram.values()).sort((a, b) => b.amount - a.amount);
}
