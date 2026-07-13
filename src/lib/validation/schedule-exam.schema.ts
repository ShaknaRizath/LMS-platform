import { z } from "zod";

export const scheduleExamSchema = z
  .object({
    availableFrom: z.coerce.date({ error: "Enter a start date/time." }),
    availableUntil: z.coerce.date({ error: "Enter an end date/time." }),
  })
  .refine((data) => data.availableUntil > data.availableFrom, {
    error: "End must be after start.",
    path: ["availableUntil"],
  });

export type ScheduleExamInput = z.infer<typeof scheduleExamSchema>;
