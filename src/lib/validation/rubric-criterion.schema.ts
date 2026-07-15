import { z } from "zod";

export const rubricCriterionSchema = z.object({
  name: z.string().min(1, { error: "Enter a criterion name." }),
  maxPoints: z.coerce
    .number({ error: "Enter the maximum points." })
    .int()
    .min(1, { error: "Max points must be at least 1." }),
});

export type RubricCriterionInput = z.infer<typeof rubricCriterionSchema>;
