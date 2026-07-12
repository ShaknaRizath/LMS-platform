import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentMethodPicker } from "@/components/student/payment-method-picker";
import { getProgramCurriculumFee } from "@/lib/fees";

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
  const fee = student.programId
    ? await getProgramCurriculumFee(student.programId, registration.yearLevel, registration.semester.semesterNumber)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Upload payment</h1>
        <p className="text-muted-foreground">
          {registration.semester.academicYear.name} — {registration.semester.name}
          {fee ? ` · Fee: LKR ${fee.toString()}` : ""}
        </p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Choose a payment method</CardTitle>
          <CardDescription>
            Once submitted, your registration will move to Pending Approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentMethodPicker registrationId={registration.id} studentId={student.id} />
        </CardContent>
      </Card>
    </div>
  );
}
