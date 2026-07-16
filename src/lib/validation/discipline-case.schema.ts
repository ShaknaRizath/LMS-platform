import { z } from "zod";

export const DISCIPLINE_OUTCOME_OPTIONS = ["NONE", "WARNING", "SUSPENSION", "EXPULSION"] as const;

export const disciplineCaseSchema = z.object({
  incidentDate: z.coerce.date({ error: "Enter the incident date." }),
  description: z.string().min(1, { error: "Enter a description of the incident." }),
});

export type DisciplineCaseInput = z.infer<typeof disciplineCaseSchema>;
