import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { DayOfWeek } from "@/generated/prisma/client";

const DAY_ORDER: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export type UpcomingSessionRow = {
  id: string;
  moduleCode: string;
  moduleTitle: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
};

/**
 * ClassSession is a recurring weekly slot (dayOfWeek + clock time), not a dated event, so
 * "upcoming this week" means ranking every session by how many days away its weekday is from
 * today (wrapping past Sunday back to Monday) rather than filtering on a date column.
 */
export async function getUpcomingClassSessions(limit = 5): Promise<UpcomingSessionRow[]> {
  const sessions = await prisma.classSession.findMany({
    where: { module: { isActive: true } },
    include: { module: { select: { code: true, title: true } } },
  });

  const todayIndex = (new Date().getDay() + 6) % 7; // JS getDay is 0=Sun..6=Sat; rotate to 0=Mon..6=Sun
  const daysUntil = (day: DayOfWeek) => (DAY_ORDER.indexOf(day) - todayIndex + 7) % 7;

  const ranked = sessions.map((session) => ({
    row: {
      id: session.id,
      moduleCode: session.module.code,
      moduleTitle: session.module.title,
      dayOfWeek: session.dayOfWeek,
      startTime: session.startTime,
      endTime: session.endTime,
      room: session.room,
    },
    rank: daysUntil(session.dayOfWeek),
  }));

  return ranked
    .sort((a, b) => a.rank - b.rank || a.row.startTime.localeCompare(b.row.startTime))
    .slice(0, limit)
    .map((entry) => entry.row);
}
