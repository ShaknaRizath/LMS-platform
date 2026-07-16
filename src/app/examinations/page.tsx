import { prisma } from "@/lib/db/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RegistrationStatusBadge } from "@/components/shared/registration-status-badge";
import { StatCard } from "@/components/shared/stat-card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { ClipboardCheck } from "lucide-react";

export default async function ExaminationUnitDashboardPage() {
  // Sequential, not Promise.all — semesterRegistration.findMany's nested include (student,
  // semester.academicYear) fans out into several sub-queries under Prisma 7's query
  // interpreter on its own; combined with the other 5 queries below in one Promise.all this
  // reproducibly exceeded the connection pool (confirmed live via a standalone script,
  // isolated to this exact query). Same bug class as the Analytics/Grade Book Promise.all
  // fixes — see cims_campus_lms_finance / cims_campus_lms_admissions memories.
  const registrations = await prisma.semesterRegistration.findMany({
    where: { status: "PENDING" },
    include: { student: true, semester: { include: { academicYear: true } } },
    orderBy: { submittedAt: "asc" },
  });
  const activeEnrollments = await prisma.enrollment.count({ where: { status: "ACTIVE" } });
  const ungradedSubmissions = await prisma.submission.count({ where: { gradedAt: null } });
  const activeSemester = await prisma.semester.findFirst({ where: { status: "ACTIVE" } });
  const scheduledExams = await prisma.quiz.count({ where: { kind: "EXAM", status: "SCHEDULED" } });
  const transcriptsIssued = await prisma.transcript.count();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Examination Unit</h1>
        <p className="text-muted-foreground">Exams, results, and academic records.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Active enrollments" value={activeEnrollments} />
        <StatCard label="Ungraded submissions" value={ungradedSubmissions} />
        <StatCard label="Active semester" value={activeSemester?.name ?? "—"} />
        <StatCard label="Scheduled exams" value={scheduledExams} />
        <StatCard label="Transcripts issued" value={transcriptsIssued} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Registrations awaiting approval</h2>
      </div>

      {registrations.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardCheck />
            </EmptyMedia>
            <EmptyTitle>No registrations pending</EmptyTitle>
            <EmptyDescription>All submitted registrations have been reviewed by an Administrator.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registrations.map((registration) => (
                <TableRow key={registration.id}>
                  <TableCell>
                    {registration.student.firstName} {registration.student.lastName}
                  </TableCell>
                  <TableCell>
                    {registration.semester.academicYear.name} — {registration.semester.name}
                  </TableCell>
                  <TableCell>{registration.submittedAt?.toLocaleDateString() ?? "—"}</TableCell>
                  <TableCell>
                    <RegistrationStatusBadge status={registration.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
