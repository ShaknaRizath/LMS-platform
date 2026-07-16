import "server-only";
import { prisma } from "@/lib/db/prisma";

// ClassSession.startTime/endTime are "HH:MM", 24h zero-padded (see that model's own comment) —
// parse into minutes-since-midnight for duration math.
function parseMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(":").map(Number);
  return hours * 60 + minutes;
}

export type LecturerWorkloadRow = {
  lecturerId: string;
  name: string;
  moduleCount: number;
  totalCredits: number;
  weeklyHours: number;
};

/**
 * Reporting view only — no "expected load"/FTE concept exists anywhere to compare against, so
 * this is what each lecturer actually carries, not a workload-limit/alert system.
 *
 * Three flat bulk queries, aggregated in-memory per lecturer — not a per-lecturer query loop,
 * same "bulk fetch once" discipline as loadFeeMap/loadScholarshipMap
 * (src/lib/finance/reports.ts).
 */
export async function getLecturerWorkloads(): Promise<LecturerWorkloadRow[]> {
  const [lecturers, assignments, sessions] = await Promise.all([
    prisma.user.findMany({ where: { role: "LECTURER", isActive: true }, orderBy: { firstName: "asc" } }),
    prisma.lecturerModuleAssignment.findMany({ include: { module: true } }),
    prisma.classSession.findMany(),
  ]);

  const moduleCountByLecturer = new Map<string, number>();
  const creditsByLecturer = new Map<string, number>();
  for (const assignment of assignments) {
    moduleCountByLecturer.set(assignment.lecturerId, (moduleCountByLecturer.get(assignment.lecturerId) ?? 0) + 1);
    creditsByLecturer.set(
      assignment.lecturerId,
      (creditsByLecturer.get(assignment.lecturerId) ?? 0) + (assignment.module.credits ?? 0)
    );
  }

  const minutesByLecturer = new Map<string, number>();
  for (const session of sessions) {
    const duration = parseMinutes(session.endTime) - parseMinutes(session.startTime);
    minutesByLecturer.set(session.lecturerId, (minutesByLecturer.get(session.lecturerId) ?? 0) + duration);
  }

  return lecturers
    .map((lecturer) => ({
      lecturerId: lecturer.id,
      name: `${lecturer.firstName} ${lecturer.lastName}`,
      moduleCount: moduleCountByLecturer.get(lecturer.id) ?? 0,
      totalCredits: creditsByLecturer.get(lecturer.id) ?? 0,
      weeklyHours: (minutesByLecturer.get(lecturer.id) ?? 0) / 60,
    }))
    .sort((a, b) => b.weeklyHours - a.weeklyHours);
}
