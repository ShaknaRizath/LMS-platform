import { notFound } from "next/navigation";
import Link from "next/link";
import { Download, GraduationCap } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IssueCertificateButton } from "@/components/examinations/issue-certificate-button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default async function ExaminationUnitStudentCertificatesPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  await requireRole(["EXAMINATION_UNIT"]);

  const student = await prisma.user.findUnique({ where: { id: studentId }, include: { program: true } });
  if (!student || student.role !== "STUDENT") notFound();

  const [enrollments, certificates] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId },
      include: { module: true },
      orderBy: { enrolledAt: "desc" },
    }),
    prisma.certificate.findMany({ where: { studentId } }),
  ]);
  const certificateByModuleId = new Map(certificates.map((certificate) => [certificate.moduleId, certificate]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {student.firstName} {student.lastName}
        </h1>
        <p className="text-muted-foreground">
          {student.email} {student.program ? `· ${student.program.name}` : ""}
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GraduationCap />
            </EmptyMedia>
            <EmptyTitle>No module enrollments</EmptyTitle>
            <EmptyDescription>This student has no enrollments to certify yet.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {enrollments.map((enrollment) => {
            const certificate = certificateByModuleId.get(enrollment.moduleId);
            return (
              <div
                key={enrollment.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {enrollment.module.code} — {enrollment.module.title}
                    </p>
                    <Badge variant={enrollment.status === "COMPLETED" ? "default" : "outline"}>
                      {enrollment.status}
                    </Badge>
                  </div>
                  {certificate && (
                    <p className="text-xs text-muted-foreground">
                      Issued {certificate.issuedAt.toLocaleDateString()} · Code {certificate.verificationCode}
                    </p>
                  )}
                </div>
                {certificate ? (
                  <Button variant="outline" size="sm" nativeButton={false} render={<Link href={certificate.fileUrl} target="_blank" />}>
                    <Download />
                    Download
                  </Button>
                ) : (
                  <IssueCertificateButton studentId={studentId} moduleId={enrollment.moduleId} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
