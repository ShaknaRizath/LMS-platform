import { z } from "zod";

export const applicationSchema = z.object({
  firstName: z.string().min(1, { error: "Enter your first name." }),
  lastName: z.string().min(1, { error: "Enter your last name." }),
  email: z.email({ error: "Enter a valid email address." }),
  phone: z.string().optional(),
  programId: z.string().min(1, { error: "Select a program." }),
  statement: z.string().optional(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const rejectApplicationSchema = z.object({
  reason: z.string().min(1, { error: "Enter a reason for rejecting this application." }),
});
