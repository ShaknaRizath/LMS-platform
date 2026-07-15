"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertLecturerOwnsModule } from "@/lib/auth/ownership";
import { attendanceStatusSchema } from "@/lib/validation/attendance.schema";
import type { ActionState } from "@/lib/actions/action-state";
import type { DayOfWeek } from "@/generated/prisma/client";

const JS_DAY_TO_DAY_OF_WEEK: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export async function recordAttendance(
  classSessionId: string,
  moduleId: string,
  occurrenceDate: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  const session = await prisma.classSession.findUnique({ where: { id: classSessionId } });
  if (!session || session.moduleId !== moduleId || session.lecturerId !== lecturer.id) {
    return { error: "You can only take attendance for your own class sessions." };
  }

  const date = new Date(`${occurrenceDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return { error: "Invalid date." };
  }
  if (JS_DAY_TO_DAY_OF_WEEK[date.getDay()] !== session.dayOfWeek) {
    return { error: `This session runs on ${session.dayOfWeek.toLowerCase()}s — pick a matching date.` };
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { moduleId, status: "ACTIVE" },
    select: { studentId: true },
  });

  const entries: { studentId: string; status: "PRESENT" | "ABSENT" | "LATE" }[] = [];
  for (const enrollment of enrollments) {
    const raw = formData.get(`status_${enrollment.studentId}`);
    const parsed = attendanceStatusSchema.safeParse(raw);
    if (parsed.success) {
      entries.push({ studentId: enrollment.studentId, status: parsed.data });
    }
  }

  await prisma.$transaction(
    entries.map((entry) =>
      prisma.attendanceRecord.upsert({
        where: {
          classSessionId_occurrenceDate_studentId: {
            classSessionId,
            occurrenceDate: date,
            studentId: entry.studentId,
          },
        },
        update: { status: entry.status, markedById: lecturer.id, markedAt: new Date() },
        create: {
          classSessionId,
          occurrenceDate: date,
          studentId: entry.studentId,
          status: entry.status,
          markedById: lecturer.id,
        },
      })
    )
  );

  revalidatePath(`/lecturer/modules/${moduleId}/attendance`);
  revalidatePath("/student/attendance");
  return undefined;
}
