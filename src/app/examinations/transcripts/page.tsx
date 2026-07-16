import Link from "next/link";
import { ScrollText, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default async function ExaminationUnitTranscriptsPage() {
  await requireRole(["EXAMINATION_UNIT"]);

  const [students, recentTranscripts] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT", isActive: true },
      include: { program: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.transcript.findMany({
      include: { student: true },
      orderBy: { issuedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Transcripts</h1>
        <p className="text-muted-foreground">Issue official academic transcripts and review recent activity.</p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Recently issued</h2>
        {recentTranscripts.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ScrollText />
              </EmptyMedia>
              <EmptyTitle>No transcripts issued yet</EmptyTitle>
              <EmptyDescription>Pick a student below to issue their first transcript.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Cumulative GPA</TableHead>
                  <TableHead>Issued</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTranscripts.map((transcript) => (
                  <TableRow key={transcript.id}>
                    <TableCell>
                      {transcript.student.firstName} {transcript.student.lastName}
                    </TableCell>
                    <TableCell>
                      {transcript.cumulativeGpa !== null ? Number(transcript.cumulativeGpa).toFixed(2) : "—"}
                    </TableCell>
                    <TableCell>{transcript.issuedAt.toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Students</h2>
        <div className="flex flex-col gap-3">
          {students.map((student) => (
            <Link key={student.id} href={`/examinations/transcripts/${student.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle>
                        {student.firstName} {student.lastName}
                      </CardTitle>
                      <CardDescription>
                        {student.email} {student.program ? `· ${student.program.name}` : ""}
                      </CardDescription>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
