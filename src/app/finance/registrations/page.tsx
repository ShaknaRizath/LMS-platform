import Link from "next/link";
import { ClipboardCheck } from "lucide-react";
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

export default async function FinanceRegistrationsPage() {
  const registrations = await prisma.semesterRegistration.findMany({
    include: { student: true, semester: { include: { academicYear: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Registrations</h1>
        <p className="text-muted-foreground">Verify payments and approve semester registrations.</p>
      </div>

      {registrations.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardCheck />
            </EmptyMedia>
            <EmptyTitle>No registrations yet</EmptyTitle>
            <EmptyDescription>Registrations will appear here once students register.</EmptyDescription>
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
                    <Link href={`/finance/registrations/${registration.id}`} className="font-medium hover:underline">
                      {registration.student.firstName} {registration.student.lastName}
                    </Link>
                    <p className="text-sm text-muted-foreground">{registration.student.email}</p>
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
