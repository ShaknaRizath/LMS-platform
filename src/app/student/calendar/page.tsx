import { prisma } from "@/lib/db/prisma";
import { CalendarEventList } from "@/components/shared/calendar-event-list";
import { EventCalendar } from "@/components/shared/event-calendar";

export default async function StudentCalendarPage() {
  const events = await prisma.calendarEvent.findMany({ orderBy: { startDate: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
      <EventCalendar events={events} />
      <CalendarEventList events={events} />
    </div>
  );
}
