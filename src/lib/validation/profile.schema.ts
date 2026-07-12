import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(1, { error: "Enter a first name." }),
  lastName: z.string().min(1, { error: "Enter a last name." }),
  phone: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
