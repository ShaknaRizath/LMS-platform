import { z } from "zod";

export const weekSchema = z.object({
  weekNumber: z.coerce.number().int().min(1, { error: "Week number must be at least 1." }),
  title: z.string().optional(),
  description: z.string().optional(),
});

export type WeekInput = z.infer<typeof weekSchema>;
