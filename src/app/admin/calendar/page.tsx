import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { CalendarEventForm } from "@/components/admin/calendar-event-form";
import { CalendarEventList } from "@/components/shared/calendar-event-list";
import { deleteCalendarEvent } from "@/lib/actions/admin/calendar.actions";

export default async function AdminCalendarPage() {
  const events = await prisma.calendarEvent.findMany({ orderBy: { startDate: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
        <p className="text-muted-foreground">Semester dates, exams, holidays, and deadlines.</p>
      </div>

      <CalendarEventForm />

      <CalendarEventList
        events={events}
        renderActions={(event) => (
          <form action={deleteCalendarEvent.bind(null, event.id)}>
            <Button type="submit" variant="ghost" size="sm">
              Delete
            </Button>
          </form>
        )}
      />
    </div>
  );
}
