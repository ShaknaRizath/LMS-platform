import { Badge } from "@/components/ui/badge";
import type { CalendarEventType } from "@/generated/prisma/enums";

const TYPE_LABELS: Record<CalendarEventType, string> = {
  SEMESTER_START: "Semester start",
  SEMESTER_END: "Semester end",
  EXAM_PERIOD: "Exam period",
  HOLIDAY: "Holiday",
  DEADLINE: "Deadline",
  OTHER: "Other",
};

export type CalendarEventData = {
  id: string;
  title: string;
  description: string | null;
  type: CalendarEventType;
  startDate: Date;
  endDate: Date | null;
};

export function CalendarEventList({
  events,
  renderActions,
}: {
  events: CalendarEventData[];
  renderActions?: (event: CalendarEventData) => React.ReactNode;
}) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No calendar events yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card p-4"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{event.title}</p>
              <Badge variant="outline">{TYPE_LABELS[event.type]}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {event.startDate.toLocaleDateString()}
              {event.endDate ? ` – ${event.endDate.toLocaleDateString()}` : ""}
            </p>
            {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
          </div>
          {renderActions?.(event)}
        </div>
      ))}
    </div>
  );
}
