import { z } from "zod";

export const assessmentCategorySchema = z.object({
  name: z.string().min(1, { error: "Enter a category name." }),
  weightPercent: z.coerce
    .number({ error: "Enter a weight." })
    .int()
    .min(1, { error: "Weight must be at least 1%." })
    .max(100, { error: "Weight can't exceed 100%." }),
});

export type AssessmentCategoryInput = z.infer<typeof assessmentCategorySchema>;
