import { z } from "zod";

export const verifyPaymentSchema = z
  .object({
    decision: z.enum(["VERIFIED", "REJECTED"], { error: "Choose a decision." }),
    notes: z.string().optional(),
  })
  .refine((data) => data.decision !== "REJECTED" || (data.notes && data.notes.trim().length >= 5), {
    error: "Provide a reason (at least 5 characters) when rejecting a payment.",
    path: ["notes"],
  });

export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

export const rejectRegistrationSchema = z.object({
  reason: z.string().min(10, { error: "Reason must be at least 10 characters." }),
});

export type RejectRegistrationInput = z.infer<typeof rejectRegistrationSchema>;
