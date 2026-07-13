import { z } from "zod";

export const essayGradeSchema = z.object({
  pointsAwarded: z.coerce
    .number({ error: "Enter the points to award." })
    .int()
    .min(0, { error: "Points can't be negative." }),
});

export type EssayGradeInput = z.infer<typeof essayGradeSchema>;
