import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClassSessionForm } from "@/components/scheduling/class-session-form";
import { EditClassSessionDialog } from "@/components/scheduling/edit-class-session-dialog";
import { createClassSession, deleteClassSession } from "@/lib/actions/scheduling/class-session.actions";
import type { DayOfWeek } from "@/generated/prisma/client";

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export function TimetableCard({
  moduleId,
  sessions,
  lecturers,
}: {
  moduleId: string;
  sessions: {
    id: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    room: string;
    lecturerId: string;
    updatedAt: Date;
    lecturer: { firstName: string; lastName: string };
  }[];
  lecturers: { id: string; firstName: string; lastName: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timetable</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {sessions.length > 0 && (
          <ul className="flex flex-col gap-2">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <span className="text-sm">
                  {DAY_LABELS[session.dayOfWeek]} · {session.startTime}-{session.endTime} ·{" "}
                  {session.room} · {session.lecturer.firstName} {session.lecturer.lastName}
                </span>
                <div className="flex items-center gap-2">
                  <EditClassSessionDialog session={session} moduleId={moduleId} lecturers={lecturers} />
                  <form action={deleteClassSession.bind(null, session.id, moduleId)}>
                    <Button type="submit" variant="ghost" size="sm">
                      Remove
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
        {sessions.length === 0 && (
          <p className="text-sm text-muted-foreground">No class sessions scheduled yet.</p>
        )}
        <ClassSessionForm lecturers={lecturers} action={createClassSession.bind(null, moduleId)} />
      </CardContent>
    </Card>
  );
}
