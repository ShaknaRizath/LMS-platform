"use client";

import { useEffect, useRef, useState } from "react";
import { X, CalendarDays, Search, ChevronLeft, ChevronRight } from "lucide-react";
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
  events = [],
  todayColor = "#3FA9D6",
  dotColor = "#3EA9BB",
  compact = false,
  showEventsPanel = true,
  cellSize,
  chooseDateStyle = false,
  flatBackground = false,
  denseSpacing = false,
  monthTitleHeader = false,
}: {
  events?: CalendarEventData[];
  todayColor?: string;
  dotColor?: string;
  // Hides the "Calendar" title and lets the grid stretch to the card's full
  // width (fixed cell height, so it grows wider without growing taller).
  compact?: boolean;
  // Renders a bare date-picker with no "Upcoming"/selected-day event list below it
  // (and no event dots on the grid, since there's nothing passed in to mark) — for
  // spots that just need a plain browsable calendar, not an events feed.
  showEventsPanel?: boolean;
  // Overrides the default cell size (11 compact / 8 regular, in Tailwind spacing units) —
  // for narrower slots (e.g. a quarter-width dashboard column) where even the "compact"
  // 11-unit cells don't fit without clipping the Saturday column.
  cellSize?: number;
  // Restyles the widget after a native browser date-picker popup: a flat "Choose Date" +
  // clear(X) header bar in place of the usual card title, «/» text arrows instead of chevron
  // icons for month nav, and no card border/shadow — a deliberately different look from every
  // other MiniCalendarCard usage, opt in only where that reference look was asked for.
  chooseDateStyle?: boolean;
  // The underlying Calendar renders its own opaque bg-background (normally neutralized only
  // when nested inside a CardContent, which this component doesn't use) — that opaque fill
  // sits at a different shade than the surrounding Card, reading as a "card inside a card" grey
  // box. This flag suppresses it so the grid sits flush against the Card's own background.
  flatBackground?: boolean;
  // Tighter card padding and row spacing than the default — same idea as chooseDateStyle's
  // compactness, but keeps the normal "Calendar" title/card chrome so it still reads as part of
  // this app's card system rather than a native-picker mimic.
  denseSpacing?: boolean;
  // Drops the separate "Calendar" card title in favor of using the month/year itself (e.g.
  // "July 2026") as the header, nav arrows grouped together at the far right, a divider
  // underneath, and a full-width evenly-spaced grid instead of a fixed-size centered one.
  monthTitleHeader?: boolean;
}) {
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  // Always opens on the current month (matches EventCalendar's same change) so "today" is
  // visible and highlighted by default, instead of jumping to whichever month happens to hold
  // the nearest calendar event. Controlled (not defaultMonth) so the jump-to-date picker below
  // can programmatically move the displayed month, not just track the user's own prev/next clicks.
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const now = new Date();

  useEffect(() => {
    if (!selected && !showDatePicker) return;

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setSelected(undefined);
        setShowDatePicker(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [selected, showDatePicker]);

  function handleJumpToDate(value: string) {
    if (!value) return;
    const [year, month, day] = value.split("-").map(Number);
    const jumped = new Date(year, month - 1, day);
    setViewMonth(jumped);
    setSelected(jumped);
    setShowDatePicker(false);
  }

  const upcoming = events
    .filter((event) => (event.endDate ?? event.startDate) >= now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
    .slice(0, 3);

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
    <div
      ref={containerRef}
      className={chooseDateStyle ? "w-fit" : undefined}
      style={
        {
          "--cal-today": todayColor,
          "--cal-dot": dotColor,
          "--cell-size": `calc(var(--spacing) * ${cellSize ?? (compact ? 11 : 8)})`,
          "--card-spacing": `calc(var(--spacing) * ${chooseDateStyle ? 2 : denseSpacing ? 3 : 4})`,
        } as React.CSSProperties
      }
    >
      <Card className={chooseDateStyle ? "gap-2 shadow-sm ring-0" : undefined}>
      {chooseDateStyle ? (
        <div className="flex items-center justify-between gap-4 px-(--card-spacing)">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="size-3.5" />
            <span>Choose Date</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-5"
            onClick={() => setSelected(undefined)}
            aria-label="Clear selected date"
          >
            <X className="size-3" />
          </Button>
        </div>
      ) : (
        !compact &&
        !monthTitleHeader && (
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
          </CardHeader>
        )
      )}
      <div className={cn("flex flex-col px-(--card-spacing)", chooseDateStyle || denseSpacing ? "gap-2" : "gap-4")}>
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(day) => setSelected((prev) => (prev && day && isSameDay(prev, day) ? undefined : day))}
          month={viewMonth}
          onMonthChange={setViewMonth}
          modifiers={modifiers}
          modifiersClassNames={{
            hasEvent:
              "relative after:absolute after:bottom-0.5 after:left-1/2 after:block after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-(--cal-dot)",
          }}
          classNames={{
            today: "rounded-full bg-(--cal-today) text-white data-[selected=true]:rounded-none",
            ...(chooseDateStyle
              ? {
                  month: "flex w-full flex-col gap-2",
                  month_caption: "flex h-(--cell-size) w-full items-center justify-center px-(--cell-size) text-sm",
                  week: "mt-1 flex w-full",
                }
              : monthTitleHeader
                ? {
                    month: "flex w-full flex-col gap-3",
                    month_caption:
                      "flex w-full items-center justify-start border-b border-border pb-3 text-lg font-semibold text-foreground",
                    nav: "absolute inset-x-0 top-0 flex w-full items-center justify-end gap-1",
                    weekday: "flex-1 text-[0.7rem] font-medium text-muted-foreground uppercase tracking-wide",
                    week: "mt-3 flex w-full",
                    day: "group/day relative flex-1 aspect-square h-full rounded-(--cell-radius) p-0 text-center select-none [&:first-child[data-selected=true]_button]:rounded-l-(--cell-radius) [&:last-child[data-selected=true]_button]:rounded-r-(--cell-radius)",
                  }
                : denseSpacing
                  ? { month: "flex w-full flex-col gap-2", week: "mt-1 flex w-full" }
                  : {}),
          }}
          className={cn(
            monthTitleHeader ? "w-full" : "mx-auto w-fit",
            "p-0",
            flatBackground && "bg-transparent",
            chooseDateStyle &&
              "[&_[data-selected-single=true]]:rounded-md! [&_[data-selected-single=true]]:bg-(--cal-today)! [&_[data-selected-single=true]]:text-white!"
          )}
          components={
            chooseDateStyle
              ? {
                  Chevron: ({ orientation }) => (
                    <span className="px-1 text-xs text-muted-foreground">{orientation === "left" ? "«" : "»"}</span>
                  ),
                }
              : monthTitleHeader
                ? {
                    Nav: ({ onPreviousClick, onNextClick, previousMonth, nextMonth, className }) => (
                      <div className={className}>
                        <div className="relative">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setShowDatePicker((prev) => !prev)}
                            aria-label="Jump to date"
                          >
                            <Search className="size-3.5" />
                          </Button>
                          {showDatePicker && (
                            <div className="absolute top-full right-0 z-10 mt-1 rounded-lg border border-border bg-card p-2 shadow-md">
                              <input
                                type="date"
                                autoFocus
                                onChange={(event) => handleJumpToDate(event.target.value)}
                                className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground"
                              />
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={!previousMonth}
                          onClick={onPreviousClick}
                          aria-label="Previous month"
                        >
                          <ChevronLeft className="size-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          disabled={!nextMonth}
                          onClick={onNextClick}
                          aria-label="Next month"
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    ),
                  }
                : undefined
          }
        />

        {showEventsPanel &&
          (selected ? (
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
          ))}
      </div>
      </Card>
    </div>
  );
}
