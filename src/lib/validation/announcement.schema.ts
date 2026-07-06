import { z } from "zod";

export const announcementSchema = z.object({
  title: z.string().min(1, { error: "Enter a title." }),
  body: z.string().min(1, { error: "Enter the announcement body." }),
  isPinned: z
    .string()
    .optional()
    .transform((value) => value === "true"),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
