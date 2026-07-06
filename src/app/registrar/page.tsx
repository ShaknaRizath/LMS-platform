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
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { ClipboardCheck } from "lucide-react";

export default async function RegistrarDashboardPage() {
  const registrations = await prisma.semesterRegistration.findMany({
    where: { status: "PENDING" },
    include: { student: true, semester: { include: { academicYear: true } } },
    orderBy: { submittedAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Registrar</h1>
        <p className="text-muted-foreground">Registrations awaiting approval (read-only).</p>
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
