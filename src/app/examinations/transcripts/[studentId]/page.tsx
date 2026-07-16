import { notFound } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Button } from "@/components/ui/button";
import { IssueTranscriptButton } from "@/components/examinations/issue-transcript-button";

export default async function ExaminationUnitStudentTranscriptsPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;
  await requireRole(["EXAMINATION_UNIT"]);

  const student = await prisma.user.findUnique({ where: { id: studentId }, include: { program: true } });
  if (!student || student.role !== "STUDENT") notFound();

  const transcripts = await prisma.transcript.findMany({
    where: { studentId },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {student.firstName} {student.lastName}
          </h1>
          <p className="text-muted-foreground">
            {student.email} {student.program ? `· ${student.program.name}` : ""}
            {student.registrationNumber ? ` · Reg. No. ${student.registrationNumber}` : ""}
          </p>
        </div>
        <IssueTranscriptButton studentId={studentId} />
      </div>

      {transcripts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No transcripts issued yet for this student.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {transcripts.map((transcript) => (
            <div
              key={transcript.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
            >
              <div>
                <p className="text-sm font-medium">
                  Cumulative GPA:{" "}
                  {transcript.cumulativeGpa !== null ? Number(transcript.cumulativeGpa).toFixed(2) : "—"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Issued {transcript.issuedAt.toLocaleString()} · Code {transcript.verificationCode}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                nativeButton={false}
                render={<Link href={transcript.fileUrl} target="_blank" />}
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
