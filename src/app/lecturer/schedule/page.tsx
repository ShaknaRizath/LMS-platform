import Link from "next/link";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DayOfWeek } from "@/generated/prisma/client";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export default async function LecturerSchedulePage() {
  const user = await requireRole(["LECTURER"]);

  const sessions = await prisma.classSession.findMany({
    where: { lecturerId: user.id },
    include: { module: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  const byDay = new Map<DayOfWeek, typeof sessions>();
  for (const day of DAY_ORDER) byDay.set(day, []);
  for (const session of sessions) byDay.get(session.dayOfWeek)?.push(session);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Teaching Schedule</h1>
        <p className="text-muted-foreground">Your weekly class sessions across all assigned modules.</p>
      </div>

      {sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No class sessions scheduled for you yet. Your Program Coordinator or Admin manages the
          timetable for each module you teach.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {DAY_ORDER.filter((day) => (byDay.get(day)?.length ?? 0) > 0).map((day) => (
            <Card key={day}>
              <CardHeader>
                <CardTitle>{DAY_LABELS[day]}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {byDay.get(day)?.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {session.startTime}-{session.endTime} · {session.module.code}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.module.title} · Room {session.room}
                      </p>
                    </div>
                    <Button
                      nativeButton={false}
                      variant="outline"
                      size="sm"
                      render={
                        <Link
                          href={`/lecturer/modules/${session.moduleId}/attendance?sessionId=${session.id}&date=${todayIso()}`}
                        />
                      }
                    >
                      Take attendance
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
