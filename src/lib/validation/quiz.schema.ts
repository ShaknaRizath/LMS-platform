import { z } from "zod";

export const quizSchema = z.object({
  kind: z.enum(["QUIZ", "EXAM"], { error: "Select a type." }),
  title: z.string().min(1, { error: "Enter a title." }),
  description: z.string().optional(),
  timeLimitMinutes: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : undefined))
    .refine((value) => value === undefined || (Number.isInteger(value) && value > 0), {
      error: "Time limit must be a whole number of minutes.",
    }),
  maxAttempts: z.coerce
    .number({ error: "Enter the maximum number of attempts." })
    .int()
    .min(1, { error: "Attempts must be at least 1." }),
});

export type QuizInput = z.infer<typeof quizSchema>;
