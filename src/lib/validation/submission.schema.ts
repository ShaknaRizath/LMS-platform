import { z } from "zod";

export const submissionSchema = z
  .object({
    textResponse: z.string().optional(),
    fileUrl: z.union([z.url(), z.literal("")]).optional(),
  })
  .refine((data) => (data.textResponse && data.textResponse.trim().length > 0) || (data.fileUrl && data.fileUrl.length > 0), {
    error: "Enter a text response or upload a file.",
    path: ["textResponse"],
  });

export type SubmissionInput = z.infer<typeof submissionSchema>;
