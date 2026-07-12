import { z } from "zod";

export const registrationSchema = z.object({
  yearLevel: z.coerce.number().int().min(1, { error: "Select your year of study." }),
  semesterNumber: z.coerce.number().int().min(1, { error: "Select a semester." }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
