import { z } from "zod";

export const programCurriculumFeeSchema = z.object({
  amount: z.coerce.number().min(0.01, { error: "Enter a valid fee amount." }),
});

export type ProgramCurriculumFeeInput = z.infer<typeof programCurriculumFeeSchema>;
