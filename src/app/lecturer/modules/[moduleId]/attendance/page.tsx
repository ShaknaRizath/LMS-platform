import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { recordAttendance } from "@/lib/actions/lecturer/attendance.actions";
import { AttendanceRosterForm } from "@/components/lecturer/attendance-roster-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function LecturerAttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ moduleId: string }>;
  searchParams: Promise<{ sessionId?: string; date?: string }>;
}) {
  const { moduleId } = await params;
  const { sessionId, date } = await searchParams;
  const lecturer = await requireRole(["LECTURER"]);

  const module_ = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!module_) notFound();

  const sessions = await prisma.classSession.findMany({
    where: { moduleId, lecturerId: lecturer.id },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Attendance</h1>
          <p className="text-muted-foreground">{module_.code}</p>
        </div>
        <p className="text-sm text-muted-foreground">
          You have no scheduled class sessions for this module yet. Ask your Program Coordinator
          or Admin to add one on the Timetable.
        </p>
      </div>
    );
  }

  const activeSession = sessions.find((s) => s.id === sessionId) ?? sessions[0];
  const occurrenceDate = date ?? todayIso();
  const chosenWeekday = new Date(`${occurrenceDate}T00:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
  });
  const weekdayMismatch = chosenWeekday.toUpperCase() !== activeSession.dayOfWeek;

  const [enrollments, existingRecords] = await Promise.all([
    prisma.enrollment.findMany({
      where: { moduleId, status: "ACTIVE" },
      include: { student: true },
      orderBy: { student: { firstName: "asc" } },
    }),
    prisma.attendanceRecord.findMany({
      where: {
        classSessionId: activeSession.id,
        occurrenceDate: new Date(`${occurrenceDate}T00:00:00`),
      },
    }),
  ]);

  const existingStatuses = Object.fromEntries(
    existingRecords.map((record) => [record.studentId, record.status])
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Attendance</h1>
        <p className="text-muted-foreground">{module_.code}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session &amp; date</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap items-end gap-3" method="GET">
            {sessions.length > 1 && (
              <Select
                key={activeSession.id}
                name="sessionId"
                defaultValue={activeSession.id}
                items={sessions.map((session) => ({
                  value: session.id,
                  label: `${DAY_LABELS[session.dayOfWeek]} ${session.startTime}-${session.endTime} · ${session.room}`,
                }))}
              >
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {DAY_LABELS[session.dayOfWeek]} {session.startTime}-{session.endTime} · {session.room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Input type="date" name="date" defaultValue={occurrenceDate} className="w-48" />
            <Button type="submit" variant="outline">
              Update
            </Button>
          </form>
          {weekdayMismatch && (
            <p className="mt-3 text-sm text-destructive">
              {occurrenceDate} is a {chosenWeekday}, but this session runs on{" "}
              {DAY_LABELS[activeSession.dayOfWeek]}s. Pick a matching date to save attendance.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceRosterForm
            students={enrollments.map((e) => e.student)}
            existingStatuses={existingStatuses}
            action={recordAttendance.bind(null, activeSession.id, moduleId, occurrenceDate)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
