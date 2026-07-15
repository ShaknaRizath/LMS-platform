import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/admin/user-form";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { updateUser, setUserActive, deleteUser } from "@/lib/actions/admin/user.actions";
import { computeStudentAcademicRecord } from "@/lib/grades/gpa";
import type { AttendanceStatus } from "@/generated/prisma/client";

const ATTENDANCE_STATUS_VARIANT: Record<AttendanceStatus, "secondary" | "destructive" | "outline"> = {
  PRESENT: "secondary",
  ABSENT: "destructive",
  LATE: "outline",
};

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const [user, programs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.program.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!user) notFound();

  const toggleAction = setUserActive.bind(null, user.id, !user.isActive);

  const [
    assignmentCount,
    registrationCount,
    enrollmentCount,
    announcementCount,
    calendarEventCount,
    contentItemCount,
    submissionCount,
    attendanceCount,
  ] = await Promise.all([
    prisma.lecturerModuleAssignment.count({ where: { lecturerId: userId } }),
    prisma.semesterRegistration.count({ where: { studentId: userId } }),
    prisma.enrollment.count({ where: { studentId: userId } }),
    prisma.announcement.count({ where: { authorId: userId } }),
    prisma.calendarEvent.count({ where: { createdById: userId } }),
    prisma.contentItem.count({ where: { createdById: userId } }),
    prisma.submission.count({ where: { studentId: userId } }),
    prisma.attendanceRecord.count({ where: { studentId: userId } }),
  ]);
  const hasHistory =
    assignmentCount +
      registrationCount +
      enrollmentCount +
      announcementCount +
      calendarEventCount +
      contentItemCount +
      submissionCount +
      attendanceCount >
    0;
  const deleteWarning = hasHistory
    ? `This account has ${assignmentCount} lecturer assignment(s), ${registrationCount} registration(s), ${enrollmentCount} enrollment(s), ${announcementCount} announcement(s), ${calendarEventCount} calendar event(s), ${contentItemCount} content item(s), ${submissionCount} submission(s), and ${attendanceCount} attendance record(s) linked to it. Deactivate it instead — this account can't be deleted until that history is cleared.`
    : "This permanently deletes the account. This cannot be undone.";

  const [attendanceRecords, allAttendanceStatuses] = await Promise.all([
    prisma.attendanceRecord.findMany({
      where: { studentId: userId },
      include: { classSession: { include: { module: true } } },
      orderBy: { occurrenceDate: "desc" },
      take: 10,
    }),
    prisma.attendanceRecord.findMany({ where: { studentId: userId }, select: { status: true } }),
  ]);
  const attendedCount = allAttendanceStatuses.filter(
    (r) => r.status === "PRESENT" || r.status === "LATE"
  ).length;
  const attendanceRate =
    attendanceCount > 0 ? `${Math.round((attendedCount / allAttendanceStatuses.length) * 100)}%` : "—";

  const academicRecord = await computeStudentAcademicRecord(userId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={user.isActive ? "secondary" : "outline"}>
            {user.isActive ? "Active" : "Deactivated"}
          </Badge>
          <form action={toggleAction}>
            <Button type="submit" variant="outline">
              {user.isActive ? "Deactivate" : "Reactivate"}
            </Button>
          </form>
          <DeleteConfirmButton
            action={deleteUser.bind(null, user.id)}
            title={`Delete ${user.firstName} ${user.lastName}?`}
            description={deleteWarning}
          />
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Edit user</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            action={updateUser.bind(null, user.id)}
            mode="edit"
            programs={programs}
            defaultValues={user}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>

      {user.role === "STUDENT" && (
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              {attendanceRate} attendance rate across {allAttendanceStatuses.length} recorded class(es).
            </p>
            {attendanceRecords.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {attendanceRecords.map((record) => (
                  <li
                    key={record.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      {record.occurrenceDate.toLocaleDateString()} · {record.classSession.module.code}
                    </span>
                    <Badge variant={ATTENDANCE_STATUS_VARIANT[record.status]}>{record.status}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No attendance recorded yet.</p>
            )}
          </CardContent>
        </Card>
      )}

      {user.role === "STUDENT" && (
        <Card>
          <CardHeader>
            <CardTitle>Academic Record</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Cumulative GPA:{" "}
              <span className="font-medium text-foreground">
                {academicRecord.cumulativeGpa !== null ? academicRecord.cumulativeGpa.toFixed(2) : "—"}
              </span>
            </p>
            {academicRecord.semesters.length > 0 ? (
              <div className="flex flex-col gap-4">
                {academicRecord.semesters.map((semester) => (
                  <div key={semester.semesterId} className="rounded-lg border border-border p-3">
                    <p className="text-sm font-medium text-foreground">
                      {semester.academicYearName} — {semester.semesterName} · GPA{" "}
                      {semester.semesterGpa !== null ? semester.semesterGpa.toFixed(2) : "—"}
                    </p>
                    <ul className="mt-2 flex flex-col gap-1">
                      {semester.modules.map((module_) => (
                        <li
                          key={module_.moduleId}
                          className="flex items-center justify-between text-sm text-muted-foreground"
                        >
                          <span>
                            {module_.code} — {module_.title} ({module_.credits ?? "—"} credits)
                          </span>
                          <span>
                            {module_.percentage !== null ? `${Math.round(module_.percentage)}%` : "—"}
                            {module_.letter ? ` (${module_.letter})` : ""}
                            {!module_.isComplete && " · in progress"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No enrollments yet.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
