import { z } from "zod";

const baseFields = {
  title: z.string().min(1, { error: "Enter a title." }),
  description: z.string().optional(),
  isAssignment: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  dueDate: z
    .string()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
};

export const contentItemSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("FILE"),
    ...baseFields,
    fileUrl: z.url({ error: "Upload a file first." }),
    fileName: z.string().min(1),
    fileSizeBytes: z.coerce.number().int().optional(),
    mimeType: z.string().optional(),
  }),
  z.object({
    type: z.literal("LINK"),
    ...baseFields,
    linkUrl: z.url({ error: "Enter a valid URL, starting with https://" }),
  }),
  z.object({
    type: z.literal("VIDEO"),
    ...baseFields,
    videoUrl: z.url({ error: "Enter a valid video URL, starting with https://" }),
  }),
  z.object({
    type: z.literal("ZOOM"),
    ...baseFields,
    zoomJoinUrl: z.url({ error: "Enter a valid Zoom join URL, starting with https://" }),
    zoomMeetingId: z.string().optional(),
    zoomPasscode: z.string().optional(),
  }),
  z.object({
    type: z.literal("GOOGLE_MEET"),
    ...baseFields,
    meetJoinUrl: z.url({ error: "Enter a valid Google Meet join URL, starting with https://" }),
  }),
  z.object({
    type: z.literal("RICH_TEXT"),
    ...baseFields,
    richTextHtml: z.string().min(1, { error: "Enter some content." }),
  }),
]);

export type ContentItemInput = z.infer<typeof contentItemSchema>;
