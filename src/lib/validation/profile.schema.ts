import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(1, { error: "Enter a first name." }),
  lastName: z.string().min(1, { error: "Enter a last name." }),
  phone: z.string().optional(),
  dateOfBirth: z.coerce.date().optional().or(z.literal("").transform(() => undefined)),
  address: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
