import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { PaymentLookup } from "@/components/student/payment-lookup";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Wallet } from "lucide-react";

export default async function StudentPaymentsPage() {
  const student = await requireRole(["STUDENT"]);

  if (!student.programId) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Wallet />
          </EmptyMedia>
          <EmptyTitle>No program assigned</EmptyTitle>
          <EmptyDescription>
            Contact your administrator to have a program assigned to your account before making a payment.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const semesters = await prisma.semester.findMany({
    where: { modules: { some: { programId: student.programId } } },
    include: { academicYear: true },
    orderBy: [{ academicYear: { startDate: "desc" } }, { semesterNumber: "asc" }],
  });

  const academicYears = Array.from(
    new Map(semesters.map((s) => [s.academicYearId, s.academicYear])).values()
  ).sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  const registrations = await prisma.semesterRegistration.findMany({
    where: { studentId: student.id, semesterId: { in: semesters.map((s) => s.id) } },
    select: { id: true, semesterId: true, status: true, yearLevel: true },
  });

  const [fees, scholarship] = await Promise.all([
    prisma.programCurriculumFee.findMany({ where: { programId: student.programId } }),
    prisma.scholarship.findFirst({
      where: { studentId: student.id, status: "APPROVED" },
      orderBy: { decidedAt: "desc" },
    }),
  ]);

  function applyDiscount(amount: number): number {
    if (!scholarship || scholarship.discountType === null || scholarship.discountValue === null) return amount;
    const discount =
      scholarship.discountType === "PERCENTAGE"
        ? (amount * Number(scholarship.discountValue)) / 100
        : Number(scholarship.discountValue);
    return Math.max(0, amount - discount);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Payment</h1>
        <p className="text-muted-foreground">
          Select the academic year and semester you want to pay for.
        </p>
      </div>

      {semesters.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Wallet />
            </EmptyMedia>
            <EmptyTitle>No semesters available</EmptyTitle>
            <EmptyDescription>
              There are no semesters set up yet for your program.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <PaymentLookup
          academicYears={academicYears.map((y) => ({ id: y.id, name: y.name }))}
          semesters={semesters.map((s) => ({
            id: s.id,
            name: s.name,
            academicYearId: s.academicYearId,
            semesterNumber: s.semesterNumber,
          }))}
          registrations={registrations.map((r) => ({
            semesterId: r.semesterId,
            registrationId: r.id,
            status: r.status,
            yearLevel: r.yearLevel,
          }))}
          fees={fees.map((f) => ({
            yearLevel: f.yearLevel,
            semesterNumber: f.semesterNumber,
            amount: applyDiscount(Number(f.amount)).toString(),
          }))}
        />
      )}
    </div>
  );
}
