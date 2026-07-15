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

/**
 * Resolves "expected" fee vs. "paid" (verified payments) per non-rejected registration.
 * One flat query for registrations + one for all curriculum fees (not per-registration
 * lookups), so this stays a fixed 2 queries regardless of how many registrations exist.
 */
export async function getOutstandingBalances(): Promise<{
  rows: OutstandingBalanceRow[];
  totalOutstanding: number;
}> {
  const [registrations, feeMap] = await Promise.all([
    prisma.semesterRegistration.findMany({
      where: { status: { not: "REJECTED" } },
      include: {
        student: { include: { program: true } },
        semester: true,
        paymentRecords: { where: { verificationStatus: "VERIFIED" }, select: { amount: true } },
      },
    }),
    loadFeeMap(),
  ]);

  const rows: OutstandingBalanceRow[] = registrations.map((registration) => {
    const paid = registration.paymentRecords.reduce((sum, p) => sum + Number(p.amount), 0);
    const expected = registration.student.programId
      ? (feeMap.get(
          `${registration.student.programId}-${registration.yearLevel}-${registration.semester.semesterNumber}`
        ) ?? 0)
      : 0;
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
