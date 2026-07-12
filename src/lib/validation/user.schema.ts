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
  // The Select submits "" when left at its "No program" placeholder (e.g. every non-student
  // role) — normalize that to undefined so Prisma leaves the FK unset instead of trying to
  // satisfy it with an empty string, which violates the constraint.
  programId: z
    .string()
    .optional()
    .transform((value) => value || undefined),
});

export type UserInput = z.infer<typeof userSchema>;

export const createUserSchema = userSchema.extend({
  // Optional: if the admin sets one directly, the account is usable immediately without
  // relying on outbound email (this app's notifications fall back to a console-only stub
  // unless a real email provider is configured). Left blank, the existing invite-link flow applies.
  // The field submits "" (not absent) when left untouched, so normalize that to undefined
  // before length-checking it — otherwise every user creation fails the min-length check.
  password: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined))
    .refine((value) => value === undefined || value.length >= 8, {
      error: "Password must be at least 8 characters.",
    }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = userSchema.omit({ email: true });

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
