import { z } from "zod";

export const learningOutcomeSchema = z.object({
  code: z.string().min(1, { error: "Enter a code, e.g. LO1." }),
  description: z.string().min(1, { error: "Enter a description." }),
});

export type LearningOutcomeInput = z.infer<typeof learningOutcomeSchema>;
