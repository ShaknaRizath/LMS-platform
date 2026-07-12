import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RegistrationStatusBadge } from "@/components/shared/registration-status-badge";
import { PaymentVerificationForm } from "@/components/admin/payment-verification-form";
import {
  ApproveRegistrationButton,
  RejectRegistrationDialog,
} from "@/components/admin/registration-decision-buttons";

export default async function FinanceRegistrationDetailPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const { registrationId } = await params;

  const registration = await prisma.semesterRegistration.findUnique({
    where: { id: registrationId },
    include: {
      student: true,
      semester: { include: { academicYear: true } },
      registrationModules: { include: { module: true } },
      paymentRecords: { orderBy: { uploadedAt: "desc" }, include: { verifiedBy: true } },
    },
  });
  if (!registration) notFound();

  const hasVerifiedPayment = registration.paymentRecords.some((p) => p.verificationStatus === "VERIFIED");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {registration.student.firstName} {registration.student.lastName}
          </h1>
          <p className="text-muted-foreground">{registration.student.email}</p>
        </div>
        <RegistrationStatusBadge status={registration.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Year {registration.yearLevel} — {registration.semester.academicYear.name} — {registration.semester.name}
          </CardTitle>
          <CardDescription>
            Submitted {registration.submittedAt?.toLocaleDateString() ?? "—"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm font-medium">Selected modules</p>
          <ul className="flex flex-col gap-1">
            {registration.registrationModules.map((rm) => (
              <li key={rm.id} className="text-sm">
                {rm.module.code} — {rm.module.title}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {registration.rejectionReason && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Rejection reason</CardTitle>
            <CardDescription>{registration.rejectionReason}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment records</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {registration.paymentRecords.length === 0 && (
            <p className="text-sm text-muted-foreground">No payment uploaded yet.</p>
          )}
          {registration.paymentRecords.map((payment) => (
            <div key={payment.id} className="flex flex-col gap-3 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">LKR {payment.amount.toString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.method === "GATEWAY" ? "Paid via LMS Gateway" : "Uploaded"}{" "}
                    {payment.uploadedAt.toLocaleString()}
                  </p>
                </div>
                <Badge
                  variant={
                    payment.verificationStatus === "VERIFIED"
                      ? "secondary"
                      : payment.verificationStatus === "REJECTED"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {payment.verificationStatus}
                </Badge>
              </div>
              {payment.receiptUrl ? (
                <a
                  href={payment.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View receipt{payment.receiptFileName ? ` (${payment.receiptFileName})` : ""}
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Gateway reference: {payment.gatewayReference ?? "—"}
                </p>
              )}
              {payment.verificationStatus === "PENDING" ? (
                <PaymentVerificationForm paymentRecordId={payment.id} registrationId={registration.id} />
              ) : (
                payment.verificationNotes && (
                  <p className="text-sm text-muted-foreground">Notes: {payment.verificationNotes}</p>
                )
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {registration.status === "PENDING" && (
        <div className="flex gap-3">
          <ApproveRegistrationButton registrationId={registration.id} />
          <RejectRegistrationDialog registrationId={registration.id} />
        </div>
      )}
      {registration.status === "PENDING" && !hasVerifiedPayment && (
        <p className="text-sm text-muted-foreground">
          Verify a payment record above before this registration can be approved.
        </p>
      )}
    </div>
  );
}
