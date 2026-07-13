import { z } from "zod";

export const gradeSchema = z.object({
  grade: z.coerce
    .number({ error: "Enter a grade." })
    .min(0, { error: "Grade must be at least 0." })
    .max(100, { error: "Grade must be at most 100." }),
  feedback: z.string().optional(),
});

export type GradeInput = z.infer<typeof gradeSchema>;
