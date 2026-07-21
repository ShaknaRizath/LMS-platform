import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardHeaderCard } from "@/components/student/dashboard-header-card";
import { ActivityCard, type ActivityItem } from "@/components/student/activity-card";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";
import { PaymentVerificationTable, type PaymentVerificationRow } from "@/components/finance/payment-verification-table";
import { RevenueOverviewCard } from "@/components/finance/revenue-overview-card";
import { ProgramFeeSummaryCard } from "@/components/finance/program-fee-summary-card";
import { ScholarshipPreviewCard, type ScholarshipPreviewItem } from "@/components/finance/scholarship-preview-card";
import { OpenReportsCard } from "@/components/finance/open-reports-card";
import { resolveRange } from "@/lib/analytics/queries";
import {
  getOutstandingBalances,
  collectionRateFromRows,
  getRevenueOverTime,
  getProgramFeeStatus,
} from "@/lib/finance/reports";

export default async function FinanceDashboardPage() {
  const financeUser = await requireRole(["FINANCE"]);
  const range = resolveRange({});

  const [
    pendingPayments,
    pendingScholarshipsCount,
    scholarshipPreviewRows,
    programFeeStatusRows,
    { rows: outstandingRows, totalOutstanding },
    revenueOverTime,
    recentDecidedPayments,
    recentDecidedScholarships,
    recentDecidedRegistrations,
    recentFeeChanges,
    profile,
  ] = await Promise.all([
    prisma.paymentRecord.findMany({
      where: { verificationStatus: "PENDING" },
      include: { registration: { include: { student: { include: { program: true } } } } },
      orderBy: { uploadedAt: "asc" },
    }),
    prisma.scholarship.count({ where: { status: "PENDING" } }),
    prisma.scholarship.findMany({
      where: { status: "PENDING" },
      include: { student: { include: { program: true } } },
      orderBy: { createdAt: "asc" },
      take: 5,
    }),
    getProgramFeeStatus(),
    getOutstandingBalances(),
    getRevenueOverTime(range),
    prisma.paymentRecord.findMany({
      where: { verifiedAt: { not: null } },
      include: { registration: { include: { student: true } } },
      orderBy: { verifiedAt: "desc" },
      take: 4,
    }),
    prisma.scholarship.findMany({
      where: { decidedAt: { not: null } },
      include: { student: true },
      orderBy: { decidedAt: "desc" },
      take: 4,
    }),
    prisma.semesterRegistration.findMany({
      where: { decidedAt: { not: null } },
      include: { student: true, semester: true },
      orderBy: { decidedAt: "desc" },
      take: 4,
    }),
    prisma.programCurriculumFee.findMany({
      include: { program: true },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
    prisma.user.findUnique({ where: { id: financeUser.id }, select: { avatarUrl: true } }),
  ]);

  const { rate: collectionRate } = collectionRateFromRows(outstandingRows);
  const totalRevenue = revenueOverTime.reduce((sum, day) => sum + day.amount, 0);

  const paymentRows: PaymentVerificationRow[] = pendingPayments.map((payment) => ({
    id: payment.id,
    registrationId: payment.registrationId,
    studentName: `${payment.registration.student.firstName} ${payment.registration.student.lastName}`,
    programName: payment.registration.student.program?.name ?? null,
    amount: payment.amount.toString(),
    submittedAt: payment.uploadedAt,
    status: payment.verificationStatus,
  }));

  const scholarshipItems: ScholarshipPreviewItem[] = scholarshipPreviewRows.map((application) => ({
    id: application.id,
    studentName: `${application.student.firstName} ${application.student.lastName}`,
    programName: application.student.program?.name ?? null,
    reason: application.reason,
  }));

  const activity: ActivityItem[] = [
    ...recentDecidedPayments.map((payment) => ({
      id: `payment-${payment.id}`,
      label: `LKR ${payment.amount.toString()} ${payment.verificationStatus === "VERIFIED" ? "verified" : "rejected"}`,
      detail: `${payment.registration.student.firstName} ${payment.registration.student.lastName}`,
      date: payment.verifiedAt!,
      kind: "payment" as const,
    })),
    ...recentDecidedScholarships.map((application) => ({
      id: `scholarship-${application.id}`,
      label: `Scholarship ${application.status.toLowerCase()}`,
      detail: `${application.student.firstName} ${application.student.lastName}`,
      date: application.decidedAt!,
      kind: "scholarship" as const,
    })),
    ...recentDecidedRegistrations.map((registration) => ({
      id: `registration-${registration.id}`,
      label: `Registration ${registration.status.toLowerCase()}`,
      detail: `${registration.student.firstName} ${registration.student.lastName} · ${registration.semester.name}`,
      date: registration.decidedAt!,
      kind: "registration" as const,
    })),
    ...recentFeeChanges.map((fee) => ({
      id: `fee-${fee.id}`,
      label: `${fee.createdAt.getTime() === fee.updatedAt.getTime() ? "Fee configured" : "Fee updated"}`,
      detail: `${fee.program.name} · Year ${fee.yearLevel} Sem ${fee.semesterNumber} · LKR ${fee.amount.toString()}`,
      date: fee.updatedAt,
      kind: "fee" as const,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeaderCard
        title="Finance"
        subtitle="Payments, program fees, and scholarship decisions."
        palette={COORDINATOR_PALETTE}
        className="bg-gradient-to-br from-[#eef0fd] via-[#e9ecfb] to-[#e6e9f5]"
        stats={[
          { label: "Pending payments", value: pendingPayments.length },
          { label: "Pending scholarships", value: pendingScholarshipsCount },
          { label: "Outstanding balance", value: `LKR ${totalOutstanding.toLocaleString()}` },
          { label: "Collection rate", value: collectionRate !== null ? `${Math.round(collectionRate)}%` : "—" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="lg:col-span-3">
          <PaymentVerificationTable rows={paymentRows} />
        </div>
        <ActivityCard
          className="lg:row-span-2"
          userName={financeUser.name ?? financeUser.email ?? "Finance"}
          avatarUrl={profile?.avatarUrl}
          activity={activity}
          palette={COORDINATOR_PALETTE}
        />

        <div className="lg:col-span-2">
          <RevenueOverviewCard data={revenueOverTime} totalRevenue={totalRevenue} />
        </div>
        <div className="flex flex-col gap-4 lg:col-span-1">
          <ScholarshipPreviewCard items={scholarshipItems} />
          <OpenReportsCard />
        </div>
      </div>

      <ProgramFeeSummaryCard rows={programFeeStatusRows} />
    </div>
  );
}
