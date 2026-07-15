import { z } from "zod";

export const DAYS_OF_WEEK = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const timeField = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, { error: "Use 24-hour HH:MM." });

export const classSessionSchema = z
  .object({
    moduleId: z.string().min(1, { error: "Module is required." }),
    dayOfWeek: z.enum(DAYS_OF_WEEK, { error: "Select a day." }),
    startTime: timeField,
    endTime: timeField,
    room: z.string().min(1, { error: "Room is required." }),
    lecturerId: z.string().min(1, { error: "Select a lecturer." }),
  })
  .refine((data) => data.endTime > data.startTime, {
    error: "End time must be after start time.",
    path: ["endTime"],
  });

export type ClassSessionInput = z.infer<typeof classSessionSchema>;
