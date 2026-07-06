import { z } from "zod";

export const CALENDAR_EVENT_TYPES = [
  "SEMESTER_START",
  "SEMESTER_END",
  "EXAM_PERIOD",
  "HOLIDAY",
  "DEADLINE",
  "OTHER",
] as const;

export const calendarEventSchema = z.object({
  title: z.string().min(1, { error: "Enter a title." }),
  description: z.string().optional(),
  type: z.enum(CALENDAR_EVENT_TYPES, { error: "Select an event type." }),
  startDate: z.coerce.date({ error: "Enter a valid start date." }),
  endDate: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
});

export type CalendarEventInput = z.infer<typeof calendarEventSchema>;
