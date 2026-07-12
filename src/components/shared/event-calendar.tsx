"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const TYPE_DOT_CLASSNAMES: Record<CalendarEventType, string> = {
  SEMESTER_START:
    "relative after:absolute after:bottom-0.5 after:left-1/2 after:block after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-[#5EC3E0]",
  SEMESTER_END:
    "relative after:absolute after:bottom-0.5 after:left-1/2 after:block after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-[#8B8FA3]",
  EXAM_PERIOD:
    "relative after:absolute after:bottom-0.5 after:left-1/2 after:block after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-[#E0637B]",
  HOLIDAY:
    "relative after:absolute after:bottom-0.5 after:left-1/2 after:block after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-[#6FCB8F]",
  DEADLINE:
    "relative after:absolute after:bottom-0.5 after:left-1/2 after:block after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-[#E08A3B]",
  OTHER:
    "relative after:absolute after:bottom-0.5 after:left-1/2 after:block after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-[#8B7FE0]",
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

export function EventCalendar({ events }: { events: CalendarEventData[] }) {
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const defaultMonth = useMemo(() => {
    const now = new Date();
    const upcoming = events.find((event) => event.startDate >= now);
    return (upcoming ?? events[0])?.startDate ?? now;
  }, [events]);

  const modifiers = useMemo(() => {
    const byType: Record<CalendarEventType, Date[]> = {
      SEMESTER_START: [],
      SEMESTER_END: [],
      EXAM_PERIOD: [],
      HOLIDAY: [],
      DEADLINE: [],
      OTHER: [],
    };
    for (const event of events) {
      byType[event.type].push(...eachDay(event.startDate, event.endDate ?? event.startDate));
    }
    return byType;
  }, [events]);

  const selectedDayEvents = selected
    ? events.filter((event) =>
        eachDay(event.startDate, event.endDate ?? event.startDate).some((day) => isSameDay(day, selected))
      )
    : [];

  return (
    <div ref={containerRef} className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="w-fit rounded-2xl border border-border bg-card p-3 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.16)]">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(day) => setSelected((prev) => (prev && day && isSameDay(prev, day) ? undefined : day))}
          defaultMonth={defaultMonth}
          modifiers={modifiers}
          modifiersClassNames={TYPE_DOT_CLASSNAMES}
        />
      </div>
      {selected && (
        <div className="flex min-w-56 flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.16)]">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium">
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
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{event.title}</p>
                  <Badge variant="outline">{TYPE_LABELS[event.type]}</Badge>
                </div>
                {event.description && (
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
