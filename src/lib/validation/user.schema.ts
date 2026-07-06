import { z } from "zod";

export const ROLE_OPTIONS = [
  "SUPER_ADMIN",
  "ADMIN",
  "LECTURER",
  "FINANCE",
  "REGISTRAR",
  "STUDENT",
] as const;

export const userSchema = z.object({
  email: z.email({ error: "Enter a valid email address." }),
  firstName: z.string().min(1, { error: "Enter a first name." }),
  lastName: z.string().min(1, { error: "Enter a last name." }),
  phone: z.string().optional(),
  role: z.enum(ROLE_OPTIONS, { error: "Select a role." }),
  programId: z.string().optional(),
});

export type UserInput = z.infer<typeof userSchema>;

export const updateUserSchema = userSchema.omit({ email: true });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
