import { z } from "zod";

export const ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "LATE"] as const;

export const attendanceStatusSchema = z.enum(ATTENDANCE_STATUSES);
