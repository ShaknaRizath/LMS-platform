import { z } from "zod";

export const threadSchema = z.object({
  title: z.string().min(1, { error: "Enter a title." }),
  body: z.string().min(1, { error: "Enter a message." }),
});

export type ThreadInput = z.infer<typeof threadSchema>;

export const postSchema = z.object({
  body: z.string().min(1, { error: "Enter a reply." }),
});

export type PostInput = z.infer<typeof postSchema>;
