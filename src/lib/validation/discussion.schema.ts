import { z } from "zod";

export const threadSchema = z.object({
  title: z.string().min(1, { error: "Enter a title." }),
  body: z.string().min(1, { error: "Enter a message." }),
});

export type ThreadInput = z.infer<typeof threadSchema>;

export const FORUM_CATEGORY_OPTIONS = ["GENERAL", "ACADEMIC", "EVENTS", "CAREERS", "OTHER"] as const;

export const FORUM_CATEGORY_LABELS: Record<(typeof FORUM_CATEGORY_OPTIONS)[number], string> = {
  GENERAL: "General",
  ACADEMIC: "Academic",
  EVENTS: "Events",
  CAREERS: "Careers",
  OTHER: "Other",
};

export const forumThreadSchema = threadSchema.extend({
  category: z.enum(FORUM_CATEGORY_OPTIONS, { error: "Select a category." }),
});

export type ForumThreadInput = z.infer<typeof forumThreadSchema>;

export const postSchema = z.object({
  body: z.string().min(1, { error: "Enter a reply." }),
});

export type PostInput = z.infer<typeof postSchema>;
