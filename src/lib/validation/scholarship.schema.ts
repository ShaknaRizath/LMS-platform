import { z } from "zod";

export const SCHOLARSHIP_DISCOUNT_TYPE_OPTIONS = ["PERCENTAGE", "FIXED_AMOUNT"] as const;

export const applyScholarshipSchema = z.object({
  reason: z.string().min(1, { error: "Enter a reason for your application." }),
});

export type ApplyScholarshipInput = z.infer<typeof applyScholarshipSchema>;
