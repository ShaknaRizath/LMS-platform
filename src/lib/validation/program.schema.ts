import { z } from "zod";

export const programSchema = z.object({
  name: z.string().min(2, { error: "Name must be at least 2 characters." }),
  code: z
    .string()
    .min(2, { error: "Code must be at least 2 characters." })
    .max(20, { error: "Code must be at most 20 characters." })
    .transform((value) => value.toUpperCase()),
  description: z.string().optional(),
  durationYears: z.coerce
    .number()
    .int()
    .min(1, { error: "Duration must be at least 1 year." })
    .max(10, { error: "Duration must be at most 10 years." }),
});

export type ProgramInput = z.infer<typeof programSchema>;
