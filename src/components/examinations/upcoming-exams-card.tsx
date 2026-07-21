import Link from "next/link";
import { ChevronRight, CalendarClock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";

export type UpcomingExamItem = {
  id: string;
  title: string;
  moduleCode: string;
  dateLabel: string;
  venue: string | null;
  invigilatorName: string | null;
};

export function UpcomingExamsCard({ exams }: { exams: UpcomingExamItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Upcoming Exams</CardTitle>
            <CardDescription>Scheduled exams, soonest first</CardDescription>
          </div>
          <Link
            href="/examinations/exams"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View All <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-1 px-(--card-spacing) pb-(--card-spacing)">
        {exams.length === 0 ? (
          <p className="text-sm text-muted-foreground">No exams scheduled yet.</p>
        ) : (
          exams.map((exam, index) => {
            const color = COORDINATOR_PALETTE[index % COORDINATOR_PALETTE.length];
            return (
              <Link
                key={exam.id}
                href="/examinations/exams"
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color.bg }}
                >
                  <CalendarClock className="size-4" style={{ color: color.fg }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{exam.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {exam.moduleCode} · {exam.dateLabel} · {exam.venue ?? "Venue TBD"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Invigilator: {exam.invigilatorName ?? "Unassigned"}
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
