import Link from "next/link";
import { FileCheck2 } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RegistrationStatusBadge } from "@/components/shared/registration-status-badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default async function StudentRegistrationsPage() {
  const student = await requireRole(["STUDENT"]);

  const registrations = await prisma.semesterRegistration.findMany({
    where: { studentId: student.id },
    include: { semester: { include: { academicYear: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">My Registrations</h1>

      {registrations.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileCheck2 />
            </EmptyMedia>
            <EmptyTitle>No registrations yet</EmptyTitle>
            <EmptyDescription>Register for the current semester to get started.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {registrations.map((registration) => (
            <Link key={registration.id} href={`/student/registrations/${registration.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader className="flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      {registration.semester.academicYear.name} — {registration.semester.name}
                    </CardTitle>
                    <CardDescription>
                      Submitted {registration.submittedAt?.toLocaleDateString() ?? "—"}
                    </CardDescription>
                  </div>
                  <RegistrationStatusBadge status={registration.status} />
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
