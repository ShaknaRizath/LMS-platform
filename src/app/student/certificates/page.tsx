import Link from "next/link";
import { Award, Download } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default async function StudentCertificatesPage() {
  const student = await requireRole(["STUDENT"]);

  const certificates = await prisma.certificate.findMany({
    where: { studentId: student.id },
    include: { module: true },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Certificates</h1>

      {certificates.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Award />
            </EmptyMedia>
            <EmptyTitle>No certificates yet</EmptyTitle>
            <EmptyDescription>
              Certificates are issued by the Examination Unit once you&apos;ve completed a module.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {certificates.map((certificate) => (
            <div
              key={certificate.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div>
                <p className="text-sm font-medium">
                  {certificate.module.code} — {certificate.module.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Issued {certificate.issuedAt.toLocaleDateString()} · Code {certificate.verificationCode}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={certificate.fileUrl} target="_blank" />}
              >
                <Download />
                Download
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
