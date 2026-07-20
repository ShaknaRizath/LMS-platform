"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CalendarEventData } from "@/components/shared/calendar-event-list";
import type { CalendarEventType } from "@/generated/prisma/enums";

const TYPE_LABELS: Record<CalendarEventType, string> = {
  SEMESTER_START: "Semester start",
  SEMESTER_END: "Semester end",
  EXAM_PERIOD: "Exam period",
  HOLIDAY: "Holiday",
  DEADLINE: "Deadline",
  OTHER: "Other",
};

function eachDay(start: Date, end: Date): Date[] {
  const days: Date[] = [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  while (cursor <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function MiniCalendarCard({
  events,
  todayColor = "#3FA9D6",
  dotColor = "#3EA9BB",
  compact = false,
}: {
  events: CalendarEventData[];
  todayColor?: string;
  dotColor?: string;
  // Hides the "Calendar" title and lets the grid stretch to the card's full
  // width (fixed cell height, so it grows wider without growing taller).
  compact?: boolean;
}) {
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  useEffect(() => {
    if (!selected) return;

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelected(undefined);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [selected]);

  const upcoming = events
    .filter((event) => (event.endDate ?? event.startDate) >= now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 3);

  // Always open on the current month (matches EventCalendar's same change) so "today"
  // is visible and highlighted by default, instead of jumping to whichever month
  // happens to hold the nearest calendar event.
  const defaultMonth = useMemo(() => new Date(), []);

  const selectedDayEvents = selected
    ? events.filter((event) =>
        eachDay(event.startDate, event.endDate ?? event.startDate).some((day) => isSameDay(day, selected))
      )
    : [];

  const modifiers = {
    // Excludes today so the event dot never renders on top of the today circle —
    // the circle itself is already today's indicator, and stacking a same-colored
    // dot on it is redundant (and only became visible once the dot color no longer
    // happened to blend into the circle color).
    hasEvent: events
      .flatMap((event) => eachDay(event.startDate, event.endDate ?? event.startDate))
      .filter((day) => !isSameDay(day, now)),
  };

  return (
    <div ref={containerRef} style={{ "--cal-today": todayColor, "--cal-dot": dotColor } as React.CSSProperties}>
      <Card>
      {!compact && (
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
      )}
      <div className="flex flex-col gap-4 px-(--card-spacing) pb-(--card-spacing)">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(day) => setSelected((prev) => (prev && day && isSameDay(prev, day) ? undefined : day))}
          defaultMonth={defaultMonth}
          modifiers={modifiers}
          modifiersClassNames={{
            hasEvent:
              "relative after:absolute after:bottom-0.5 after:left-1/2 after:block after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-(--cal-dot)",
          }}
          classNames={{
            today: "rounded-full bg-(--cal-today) text-white data-[selected=true]:rounded-none",
            ...(compact && { day_button: "aspect-auto h-8" }),
          }}
          className={cn("p-0 [--cell-size:--spacing(8)]", compact ? "w-full" : "mx-auto w-fit")}
        />

        {selected ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                {selected.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="-mt-1 -mr-1"
                onClick={() => setSelected(undefined)}
              >
                <X className="size-3.5" />
              </Button>
            </div>
            {selectedDayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events on this day.</p>
            ) : (
              selectedDayEvents.map((event) => (
                <div key={event.id} className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <Badge variant="outline">{TYPE_LABELS[event.type]}</Badge>
                  </div>
                  {event.description && (
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium text-muted-foreground">Upcoming</p>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming events.</p>
            ) : (
              upcoming.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelected(event.startDate)}
                  className="flex items-center justify-between gap-2 rounded-lg p-1 text-left text-sm transition-colors hover:bg-muted/60"
                >
                  <span className="truncate font-medium text-foreground">{event.title}</span>
                  <Badge variant="outline" className="shrink-0">
                    {event.startDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </Badge>
                </button>
              ))
            )}
          </div>
        )}
      </div>
      </Card>
    </div>
  );
}
