import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { StatCard } from "@/components/shared/stat-card";
import { DashboardHeaderCard } from "@/components/student/dashboard-header-card";
import { MiniCalendarCard } from "@/components/student/mini-calendar-card";
import { QuickNotesCard, type QuickNoteItem } from "@/components/shared/quick-notes-card";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";
import {
  ApplicationReviewTable,
  type ApplicationReviewRow,
} from "@/components/marketing/application-review-table";
import { ProgramInterestCard, type ProgramInterestRow } from "@/components/marketing/program-interest-card";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BreakdownPieChart } from "@/components/analytics/breakdown-pie-chart";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: COORDINATOR_PALETTE[3].accent,
  APPROVED: COORDINATOR_PALETTE[0].accent,
  REJECTED: COORDINATOR_PALETTE[2].accent,
};

export default async function MarketingOfficerDashboardPage() {
  const marketingUser = await requireRole(["MARKETING_OFFICER"]);

  const [
    totalStudents,
    totalApplications,
    applicationsInReview,
    approvedApplications,
    recentApplications,
    applicationStatusCounts,
    programCounts,
    calendarEvents,
    notes,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT", isActive: true } }),
    prisma.application.count(),
    prisma.application.count({ where: { status: "PENDING" } }),
    prisma.application.count({ where: { status: "APPROVED" } }),
    prisma.application.findMany({
      include: { program: true },
      orderBy: { submittedAt: "desc" },
      take: 5,
    }),
    prisma.application.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.application.groupBy({ by: ["programId"], _count: { _all: true } }),
    prisma.calendarEvent.findMany({ orderBy: { startDate: "asc" } }),
    prisma.staffNote.findMany({ where: { authorId: marketingUser.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const applicationReviewRows: ApplicationReviewRow[] = recentApplications.map((application) => ({
    id: application.id,
    applicantName: `${application.firstName} ${application.lastName}`,
    programName: application.program.name,
    submittedAt: application.submittedAt,
    status: application.status,
  }));

  const applicationStatusData = applicationStatusCounts.map((row) => ({
    status: row.status,
    count: row._count._all,
  }));

  const programs =
    programCounts.length > 0
      ? await prisma.program.findMany({
          where: { id: { in: programCounts.map((row) => row.programId) } },
          select: { id: true, name: true },
        })
      : [];
  const programNameById = new Map(programs.map((program) => [program.id, program.name]));
  const programInterestRows: ProgramInterestRow[] = programCounts
    .map((row) => ({
      programId: row.programId,
      programName: programNameById.get(row.programId) ?? "—",
      count: row._count._all,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const noteItems: QuickNoteItem[] = notes.map((note) => ({
    id: note.id,
    title: note.title,
    content: note.content,
    isStarred: note.isStarred,
    createdAt: note.createdAt,
  }));

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeaderCard
        title="Marketing Officer"
        subtitle="Prospective-student enquiries, applications, and recruitment."
        palette={COORDINATOR_PALETTE}
        className="bg-gradient-to-br from-[#eef0fd] via-[#e9ecfb] to-[#e6e9f5]"
        stats={[
          { label: "Enrolled students", value: totalStudents },
          { label: "Total applications", value: totalApplications },
          { label: "Applications in review", value: applicationsInReview },
          { label: "Approved applications", value: approvedApplications },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard label="Prospective enquiries" comingSoon />
        <StatCard label="Conversion rate" comingSoon />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ProgramInterestCard rows={programInterestRows} />
        <Card>
          <CardHeader>
            <CardTitle>Application Status</CardTitle>
            <CardDescription>All applications, by status</CardDescription>
          </CardHeader>
          <div className="px-(--card-spacing) pb-(--card-spacing)">
            {applicationStatusData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applications yet.</p>
            ) : (
              <BreakdownPieChart data={applicationStatusData} labels={STATUS_LABELS} colors={STATUS_COLORS} />
            )}
          </div>
        </Card>
        <QuickNotesCard notes={noteItems} palette={COORDINATOR_PALETTE} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ApplicationReviewTable rows={applicationReviewRows} />
        </div>
        <MiniCalendarCard
          events={calendarEvents}
          todayColor={COORDINATOR_PALETTE[0].accent}
          dotColor={COORDINATOR_PALETTE[2].accent}
          compact
          flatBackground
          monthTitleHeader
        />
      </div>
    </div>
  );
}
