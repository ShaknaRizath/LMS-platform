import Link from "next/link";
import { Award, ChevronRight } from "lucide-react";
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

export default async function ExaminationUnitCertificatesPage() {
  await requireRole(["EXAMINATION_UNIT"]);

  const [students, recentCertificates] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT", isActive: true },
      include: { program: true },
      orderBy: { firstName: "asc" },
    }),
    prisma.certificate.findMany({
      include: { student: true, module: true },
      orderBy: { issuedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Certificates</h1>
        <p className="text-muted-foreground">Issue module completion certificates and review recent activity.</p>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Recently issued</h2>
        {recentCertificates.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Award />
              </EmptyMedia>
              <EmptyTitle>No certificates issued yet</EmptyTitle>
              <EmptyDescription>Pick a student below to issue their first certificate.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Issued</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentCertificates.map((certificate) => (
                  <TableRow key={certificate.id}>
                    <TableCell>
                      {certificate.student.firstName} {certificate.student.lastName}
                    </TableCell>
                    <TableCell>
                      {certificate.module.code} — {certificate.module.title}
                    </TableCell>
                    <TableCell>{certificate.issuedAt.toLocaleDateString()}</TableCell>
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
            <Link key={student.id} href={`/examinations/certificates/${student.id}`}>
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
