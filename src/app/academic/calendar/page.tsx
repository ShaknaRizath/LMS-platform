import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { CalendarEventList } from "@/components/shared/calendar-event-list";

export default async function AcademicDirectorCalendarPage() {
  await requireRole(["ACADEMIC_DIRECTOR"]);

  const events = await prisma.calendarEvent.findMany({ orderBy: { startDate: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Calendar</h1>
      <CalendarEventList events={events} />
    </div>
  );
}
