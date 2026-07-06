import { z } from "zod";

export const moduleSchema = z.object({
  code: z.string().min(2, { error: "Code must be at least 2 characters." }),
  title: z.string().min(2, { error: "Title must be at least 2 characters." }),
  description: z.string().optional(),
  credits: z.coerce.number().int().min(0).optional(),
  yearLevel: z.coerce
    .number()
    .int()
    .min(1, { error: "Year level must be at least 1." })
    .max(6, { error: "Year level must be at most 6." }),
  capacity: z.coerce.number().int().min(1).optional(),
  programId: z.string().min(1, { error: "Select a program." }),
  semesterId: z.string().min(1, { error: "Select a semester." }),
});

export type ModuleInput = z.infer<typeof moduleSchema>;
