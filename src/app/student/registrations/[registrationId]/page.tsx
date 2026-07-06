import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RegistrationStatusBadge } from "@/components/shared/registration-status-badge";
import { ResubmitRegistrationForm } from "@/components/student/resubmit-registration-form";

export default async function StudentRegistrationDetailPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const { registrationId } = await params;
  const student = await requireRole(["STUDENT"]);

  const registration = await prisma.semesterRegistration.findUnique({
    where: { id: registrationId },
    include: {
      semester: { include: { academicYear: true } },
      registrationModules: { include: { module: true } },
      paymentRecords: { orderBy: { uploadedAt: "desc" } },
    },
  });
  if (!registration || registration.studentId !== student.id) notFound();

  const availableModules =
    registration.status === "REJECTED"
      ? await prisma.module.findMany({
          where: { programId: student.programId ?? undefined, semesterId: registration.semesterId, isActive: true },
          orderBy: { code: "asc" },
        })
      : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {registration.semester.academicYear.name} — {registration.semester.name}
          </h1>
          <p className="text-muted-foreground">
            Submitted {registration.submittedAt?.toLocaleDateString() ?? "—"}
          </p>
        </div>
        <RegistrationStatusBadge status={registration.status} />
      </div>

      {registration.status === "REJECTED" && registration.rejectionReason && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Rejection reason</CardTitle>
            <CardDescription>{registration.rejectionReason}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Selected modules</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-1">
            {registration.registrationModules.map((rm) => (
              <li key={rm.id} className="text-sm">
                {rm.module.code} — {rm.module.title}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {registration.paymentRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment history</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {registration.paymentRecords.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between text-sm">
                <span>
                  LKR {payment.amount.toString()} — uploaded {payment.uploadedAt.toLocaleDateString()}
                </span>
                <span className="text-muted-foreground">{payment.verificationStatus}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {registration.status === "PAYMENT_PENDING" && (
        <Button nativeButton={false} render={<Link href={`/student/register/${registration.id}/payment`} />}>
          Upload payment
        </Button>
      )}

      {registration.status === "REJECTED" && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Resubmit your registration</CardTitle>
            <CardDescription>Update your module selection and resubmit for approval.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResubmitRegistrationForm
              registrationId={registration.id}
              modules={availableModules}
              currentModuleIds={registration.registrationModules.map((rm) => rm.moduleId)}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
