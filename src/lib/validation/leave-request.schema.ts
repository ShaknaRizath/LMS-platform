import { z } from "zod";

export const LEAVE_TYPE_OPTIONS = ["ANNUAL", "SICK", "UNPAID", "OTHER"] as const;

export const leaveRequestSchema = z
  .object({
    type: z.enum(LEAVE_TYPE_OPTIONS, { error: "Select a leave type." }),
    startDate: z.coerce.date({ error: "Enter a start date." }),
    endDate: z.coerce.date({ error: "Enter an end date." }),
    reason: z.string().min(1, { error: "Enter a reason." }),
  })
  .refine((data) => data.endDate >= data.startDate, {
    error: "End date must be on or after the start date.",
    path: ["endDate"],
  });

export type LeaveRequestInput = z.infer<typeof leaveRequestSchema>;
