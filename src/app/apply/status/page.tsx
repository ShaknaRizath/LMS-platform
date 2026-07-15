import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Not approved",
};

export default async function ApplicationStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;

  const application = ref
    ? await prisma.application.findUnique({
        where: { referenceCode: ref.trim().toUpperCase() },
        include: { program: true },
      })
    : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          {ref ? (
            <div className="flex items-center gap-2">
              {application?.status === "APPROVED" && <CheckCircle2 className="size-5 text-green-600" />}
              {application?.status === "REJECTED" && <XCircle className="size-5 text-destructive" />}
              {(!application || application.status === "PENDING") && (
                <Clock className="size-5 text-muted-foreground" />
              )}
              <CardTitle>{application ? STATUS_LABELS[application.status] : "Application not found"}</CardTitle>
            </div>
          ) : (
            <CardTitle>Check your application status</CardTitle>
          )}
          <CardDescription>CIMS Campus admissions</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {ref ? (
            application ? (
              <div className="flex flex-col gap-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Applicant:</span> {application.firstName}{" "}
                  {application.lastName}
                </p>
                <p>
                  <span className="text-muted-foreground">Program:</span> {application.program.name}
                </p>
                <p>
                  <span className="text-muted-foreground">Submitted:</span>{" "}
                  {application.submittedAt.toLocaleDateString()}
                </p>
                <p>
                  <span className="text-muted-foreground">Reference:</span> {application.referenceCode}
                </p>
                {application.status === "REJECTED" && application.rejectionReason && (
                  <p className="mt-2">
                    <span className="text-muted-foreground">Reason:</span> {application.rejectionReason}
                  </p>
                )}
                {application.status === "APPROVED" && (
                  <p className="mt-2 text-muted-foreground">
                    Check your email for your offer letter and a link to set up your account.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No application matches this reference code. Double-check the code and try again.
              </p>
            )
          ) : (
            <p className="text-sm text-muted-foreground">
              Enter the reference code you received when you submitted your application.
            </p>
          )}

          <form method="GET" className="flex items-end gap-2">
            <Field className="flex-1">
              <FieldLabel htmlFor="ref">Reference code</FieldLabel>
              <Input id="ref" name="ref" defaultValue={ref ?? ""} placeholder="e.g. A1B2C3D4E5F6" />
            </Field>
            <Button type="submit" variant="outline">
              Check
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
