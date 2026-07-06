import { z } from "zod";

export const academicYearSchema = z
  .object({
    name: z.string().min(4, { error: "Name must be at least 4 characters, e.g. 2025/2026." }),
    startDate: z.coerce.date({ error: "Enter a valid start date." }),
    endDate: z.coerce.date({ error: "Enter a valid end date." }),
  })
  .refine((data) => data.endDate > data.startDate, {
    error: "End date must be after start date.",
    path: ["endDate"],
  });

export type AcademicYearInput = z.infer<typeof academicYearSchema>;

export const semesterSchema = z
  .object({
    academicYearId: z.string().min(1, { error: "Select an academic year." }),
    name: z.string().min(1, { error: "Enter a semester name." }),
    semesterNumber: z.coerce.number().int().min(1).max(4),
    startDate: z.coerce.date({ error: "Enter a valid start date." }),
    endDate: z.coerce.date({ error: "Enter a valid end date." }),
    registrationOpensAt: z.coerce.date().optional(),
    registrationClosesAt: z.coerce.date().optional(),
    feeAmount: z.coerce.number().min(0).optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    error: "End date must be after start date.",
    path: ["endDate"],
  });

export type SemesterInput = z.infer<typeof semesterSchema>;
