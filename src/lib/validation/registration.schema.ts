import { z } from "zod";

export const registrationSchema = z.object({
  semesterId: z.string().min(1, { error: "Select a semester." }),
  moduleIds: z.array(z.string()).min(1, { error: "Select at least one module." }),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const resubmitRegistrationSchema = registrationSchema.omit({ semesterId: true });

export type ResubmitRegistrationInput = z.infer<typeof resubmitRegistrationSchema>;
