import { z } from "zod";

export const EMPLOYMENT_TYPE_OPTIONS = ["FULL_TIME", "PART_TIME", "CONTRACT", "VISITING"] as const;

export const staffEmploymentSchema = z.object({
  jobTitle: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),
  department: z
    .string()
    .optional()
    .transform((value) => (value ? value : undefined)),
  // The Select submits "" when left at its "No employment type" placeholder — normalize to
  // undefined so Prisma leaves the enum column unset instead of rejecting an empty string.
  employmentType: z
    .enum(EMPLOYMENT_TYPE_OPTIONS)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  startDate: z.coerce.date().optional().or(z.literal("").transform(() => undefined)),
  contractEndDate: z.coerce.date().optional().or(z.literal("").transform(() => undefined)),
});

export type StaffEmploymentInput = z.infer<typeof staffEmploymentSchema>;
