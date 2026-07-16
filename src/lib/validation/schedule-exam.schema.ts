import { z } from "zod";

export const scheduleExamSchema = z
  .object({
    availableFrom: z.coerce.date({ error: "Enter a start date/time." }),
    availableUntil: z.coerce.date({ error: "Enter an end date/time." }),
    venue: z.string().min(1, { error: "Enter a venue." }),
    invigilatorId: z.string().min(1, { error: "Select an invigilator." }),
  })
  .refine((data) => data.availableUntil > data.availableFrom, {
    error: "End must be after start.",
    path: ["availableUntil"],
  });

export type ScheduleExamInput = z.infer<typeof scheduleExamSchema>;
