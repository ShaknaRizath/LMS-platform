import { z } from "zod";

// For any non-STUDENT role's self-service "My profile" edit — identity fields only.
// STUDENT has its own richer profileSchema (dateOfBirth/address/guardian, see
// src/lib/validation/profile.schema.ts) since those fields are student-only.
export const basicProfileSchema = z.object({
  firstName: z.string().min(1, { error: "Enter a first name." }),
  lastName: z.string().min(1, { error: "Enter a last name." }),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type BasicProfileInput = z.infer<typeof basicProfileSchema>;
