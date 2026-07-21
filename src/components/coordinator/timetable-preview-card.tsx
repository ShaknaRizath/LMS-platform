import Link from "next/link";
import { ChevronRight, CalendarClock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";
import type { UpcomingSessionRow } from "@/lib/scheduling/upcoming-sessions";

const DAY_LABELS: Record<UpcomingSessionRow["dayOfWeek"], string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

export function TimetablePreviewCard({ sessions }: { sessions: UpcomingSessionRow[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming Classes</CardTitle>
            <CardDescription>This week&apos;s schedule, soonest first</CardDescription>
          </div>
          <Link
            href="/coordinator/timetables"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View All <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-1 px-(--card-spacing) pb-(--card-spacing)">
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No class sessions scheduled yet.</p>
        ) : (
          sessions.map((session, index) => {
            const color = COORDINATOR_PALETTE[index % COORDINATOR_PALETTE.length];
            return (
              <Link
                key={session.id}
                href="/coordinator/timetables"
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color.bg }}
                >
                  <CalendarClock className="size-4" style={{ color: color.fg }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{session.moduleCode}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {DAY_LABELS[session.dayOfWeek]} {session.startTime}–{session.endTime} · Room {session.room}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
