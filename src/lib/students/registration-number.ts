import { Prisma } from "@/generated/prisma/client";

// Format: CIMS/<year>/<5-digit sequence> — sequence is a running count of all
// registration numbers ever assigned, not scoped per year. Callers must run this
// inside a transaction to avoid two students racing to the same number.
export async function generateRegistrationNumber(tx: Prisma.TransactionClient): Promise<string> {
  const count = await tx.user.count({ where: { registrationNumber: { not: null } } });
  return `CIMS/${new Date().getFullYear()}/${String(count + 1).padStart(5, "0")}`;
}

// Institutional login email derived 1:1 from the registration number, e.g.
// "CIMS/2026/00003" -> "cims202600003@cims.lk". Guaranteed unique since the
// registration number itself is unique.
export function institutionalEmailFor(registrationNumber: string): string {
  const local = registrationNumber.replace(/\//g, "").toLowerCase();
  return `${local}@cims.lk`;
}
