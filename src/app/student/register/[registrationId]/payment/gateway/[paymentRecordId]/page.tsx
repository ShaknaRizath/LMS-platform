import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  confirmGatewayPayment,
  cancelGatewayPayment,
} from "@/lib/actions/student/gateway-payment.actions";

export default async function MockGatewayCheckoutPage({
  params,
}: {
  params: Promise<{ registrationId: string; paymentRecordId: string }>;
}) {
  const { registrationId, paymentRecordId } = await params;
  const student = await requireRole(["STUDENT"]);

  const payment = await prisma.paymentRecord.findUnique({
    where: { id: paymentRecordId },
    include: { registration: { include: { semester: { include: { academicYear: true } } } } },
  });
  if (
    !payment ||
    payment.registrationId !== registrationId ||
    payment.registration.studentId !== student.id ||
    payment.method !== "GATEWAY"
  ) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center gap-6 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Mock Payment Gateway</CardTitle>
            <Badge variant="outline">Sandbox</Badge>
          </div>
          <CardDescription>
            This simulates an external payment portal (e.g. PayHere). No real payment is processed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg border border-border p-4 text-sm">
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Reference</span>
              <span className="font-mono">{payment.gatewayReference}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-muted-foreground">Semester</span>
              <span>
                {payment.registration.semester.academicYear.name} — {payment.registration.semester.name}
              </span>
            </div>
            <div className="flex justify-between py-1 text-base font-semibold">
              <span>Amount</span>
              <span>
                {payment.currency} {payment.amount.toString()}
              </span>
            </div>
          </div>

          {payment.verificationStatus === "PENDING" ? (
            <div className="flex flex-col gap-2">
              <form action={confirmGatewayPayment.bind(null, paymentRecordId, registrationId)}>
                <Button type="submit" className="w-full">
                  Pay now
                </Button>
              </form>
              <form action={cancelGatewayPayment.bind(null, paymentRecordId, registrationId)}>
                <Button type="submit" variant="ghost" className="w-full">
                  Cancel
                </Button>
              </form>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">This payment has already been processed.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
