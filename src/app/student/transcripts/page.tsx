import Link from "next/link";
import { ScrollText, Download } from "lucide-react";
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

export default async function StudentTranscriptsPage() {
  const student = await requireRole(["STUDENT"]);

  const transcripts = await prisma.transcript.findMany({
    where: { studentId: student.id },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Transcripts</h1>

      {transcripts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ScrollText />
            </EmptyMedia>
            <EmptyTitle>No transcripts yet</EmptyTitle>
            <EmptyDescription>
              Transcripts are issued by the Examination Unit on request.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
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
                  Issued {transcript.issuedAt.toLocaleDateString()} · Code {transcript.verificationCode}
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
