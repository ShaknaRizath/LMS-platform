import { CheckCircle2, XCircle } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: code },
    include: { student: true, module: { include: { program: true } } },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            {certificate ? (
              <CheckCircle2 className="size-5 text-green-600" />
            ) : (
              <XCircle className="size-5 text-destructive" />
            )}
            <CardTitle>{certificate ? "Valid certificate" : "Certificate not found"}</CardTitle>
          </div>
          <CardDescription>CIMS Campus certificate verification</CardDescription>
        </CardHeader>
        <CardContent>
          {certificate ? (
            <div className="flex flex-col gap-1 text-sm">
              <p>
                <span className="text-muted-foreground">Issued to:</span> {certificate.student.firstName}{" "}
                {certificate.student.lastName}
              </p>
              <p>
                <span className="text-muted-foreground">Module:</span> {certificate.module.code} —{" "}
                {certificate.module.title}
              </p>
              <p>
                <span className="text-muted-foreground">Program:</span> {certificate.module.program.name}
              </p>
              <p>
                <span className="text-muted-foreground">Issued on:</span>{" "}
                {certificate.issuedAt.toLocaleDateString()}
              </p>
              <p>
                <span className="text-muted-foreground">Verification code:</span> {certificate.verificationCode}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No certificate matches this verification code. Double-check the code and try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
