import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

// Deliberately shows less than /verify/[code] (Certificates): a transcript exposes a
// student's full GPA/grade history, which is more sensitive than a single-module
// certificate. This page confirms authenticity only — name, registration number,
// programme, issue date, status — never GPA, grades, or the underlying PDF.
export default async function VerifyTranscriptPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const transcript = await prisma.transcript.findUnique({
    where: { verificationCode: code },
    include: { student: { include: { program: true } } },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            {transcript ? (
              <CheckCircle2 className="size-5 text-green-600" />
            ) : (
              <XCircle className="size-5 text-destructive" />
            )}
            <CardTitle>{transcript ? "Valid transcript" : "Transcript not found"}</CardTitle>
          </div>
          <CardDescription>CIMS Campus transcript verification</CardDescription>
        </CardHeader>
        <CardContent>
          {transcript ? (
            <div className="flex flex-col gap-1 text-sm">
              <p>
                <span className="text-muted-foreground">Name:</span> {transcript.student.firstName}{" "}
                {transcript.student.lastName}
              </p>
              <p>
                <span className="text-muted-foreground">Registration No.:</span>{" "}
                {transcript.student.registrationNumber ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Programme:</span>{" "}
                {transcript.student.program?.name ?? "—"}
              </p>
              <p>
                <span className="text-muted-foreground">Issued on:</span>{" "}
                {transcript.issuedAt.toLocaleDateString()}
              </p>
              <p>
                <span className="text-muted-foreground">Status:</span> Valid
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No transcript matches this verification code. Double-check the code and try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
