import Link from "next/link";
import { ChevronRight, CalendarClock } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { LECTURER_PALETTE } from "@/components/lecturer/palette";

export type UpcomingClassItem = {
  id: string;
  moduleId: string;
  moduleCode: string;
  room: string;
  dayLabel: string;
  timeRange: string;
};

export function UpcomingClassesCard({ classes }: { classes: UpcomingClassItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Upcoming Classes</CardTitle>
          <Link
            href="/lecturer/schedule"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View All <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-1 px-(--card-spacing) pb-(--card-spacing)">
        {classes.length === 0 ? (
          <p className="text-sm text-muted-foreground">No class sessions scheduled yet.</p>
        ) : (
          classes.map((item, index) => {
            const color = LECTURER_PALETTE[index % LECTURER_PALETTE.length];
            return (
              <Link
                key={item.id}
                href={`/lecturer/modules/${item.moduleId}`}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color.bg }}
                >
                  <CalendarClock className="size-4" style={{ color: color.fg }} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.dayLabel} {item.timeRange} &middot; {item.moduleCode}
                  </p>
                  <p className="text-xs text-muted-foreground">Room {item.room}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
