import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AttendanceStatus } from "@/generated/prisma/client";

const STATUS_VARIANT: Record<AttendanceStatus, "secondary" | "destructive" | "outline"> = {
  PRESENT: "secondary",
  ABSENT: "destructive",
  LATE: "outline",
};

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
};

export default async function StudentAttendancePage() {
  const student = await requireRole(["STUDENT"]);

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: student.id },
    include: { classSession: { include: { module: true } } },
    orderBy: { occurrenceDate: "desc" },
  });

  const total = records.length;
  const attended = records.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const rate = total > 0 ? Math.round((attended / total) * 100) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Attendance</h1>
        <p className="text-muted-foreground">Your class attendance record across all modules.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Attendance rate" value={rate !== null ? `${rate}%` : "—"} />
        <StatCard label="Classes recorded" value={total} />
        <StatCard label="Classes attended" value={attended} />
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-muted-foreground">No attendance has been recorded for you yet.</p>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.occurrenceDate.toLocaleDateString()}</TableCell>
                  <TableCell>
                    {record.classSession.module.code} — {record.classSession.module.title}
                  </TableCell>
                  <TableCell>
                    {record.classSession.startTime}-{record.classSession.endTime}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[record.status]}>{STATUS_LABELS[record.status]}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
