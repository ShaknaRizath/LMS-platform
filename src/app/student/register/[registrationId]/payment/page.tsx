import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentUploadForm } from "@/components/student/payment-upload-form";
import { uploadPaymentReceipt } from "@/lib/actions/student/payment.actions";

export default async function PaymentUploadPage({
  params,
}: {
  params: Promise<{ registrationId: string }>;
}) {
  const { registrationId } = await params;
  const student = await requireRole(["STUDENT"]);

  const registration = await prisma.semesterRegistration.findUnique({
    where: { id: registrationId },
    include: { semester: { include: { academicYear: true } } },
  });
  if (!registration || registration.studentId !== student.id) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Upload payment</h1>
        <p className="text-muted-foreground">
          {registration.semester.academicYear.name} — {registration.semester.name}
          {registration.semester.feeAmount ? ` · Fee: LKR ${registration.semester.feeAmount.toString()}` : ""}
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Payment receipt</CardTitle>
          <CardDescription>
            Once submitted, your registration will move to Pending Approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentUploadForm
            action={uploadPaymentReceipt.bind(null, registration.id)}
            studentId={student.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
