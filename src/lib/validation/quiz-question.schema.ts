import { z } from "zod";

const MAX_OPTIONS = 6;

const baseQuestionFields = {
  prompt: z.string().min(1, { error: "Enter a question prompt." }),
  points: z.coerce.number({ error: "Enter points." }).int().min(1, { error: "Points must be at least 1." }),
  // Optional file attached to the question itself — any question type.
  promptFileUrl: z.string().optional().transform((value) => value || undefined),
  promptFileName: z.string().optional().transform((value) => value || undefined),
};

export const questionSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("MCQ"),
      ...baseQuestionFields,
      options: z.array(z.string().min(1)).min(2, { error: "Add at least 2 options." }),
      correctIndex: z.coerce.number({ error: "Select the correct option." }).int().min(0),
    }),
    z.object({
      type: z.literal("TRUE_FALSE"),
      ...baseQuestionFields,
      correctAnswer: z.enum(["true", "false"], { error: "Select the correct answer." }),
    }),
    z.object({
      type: z.literal("ESSAY"),
      ...baseQuestionFields,
      answerFormat: z.enum(["TEXT", "FILE"]).default("TEXT"),
    }),
  ])
  .refine((data) => data.type !== "MCQ" || data.correctIndex < data.options.length, {
    error: "Select a valid correct option.",
    path: ["correctIndex"],
  });

export type QuestionInput = z.infer<typeof questionSchema>;

// FormData can't carry a native array of objects, so MCQ options are submitted as
// indexed flat fields (optionText_0..optionText_5) and reconstructed here — same
// pragmatic approach content-item.schema.ts's discriminated union uses for
// type-specific flat fields. correctIndex on the wire refers to the rendered slot
// (0..5, including blanks); it's remapped to the filtered options array's index so a
// blank option in the middle of the list doesn't shift the correct answer.
export function buildQuestionInput(formData: FormData): Record<string, unknown> {
  const type = formData.get("type");
  const base = {
    type,
    prompt: formData.get("prompt"),
    points: formData.get("points"),
    promptFileUrl: formData.get("promptFileUrl"),
    promptFileName: formData.get("promptFileName"),
  };

  if (type === "TRUE_FALSE") {
    return { ...base, correctAnswer: formData.get("correctAnswer") };
  }

  if (type === "ESSAY") {
    return { ...base, answerFormat: formData.get("answerFormat") || "TEXT" };
  }

  const rawCorrectSlot = formData.get("correctIndex");
  const correctSlot = rawCorrectSlot !== null && rawCorrectSlot !== "" ? Number(rawCorrectSlot) : undefined;

  const options: string[] = [];
  let correctIndex: number | undefined;
  for (let slot = 0; slot < MAX_OPTIONS; slot++) {
    const value = formData.get(`optionText_${slot}`);
    if (typeof value === "string" && value.trim().length > 0) {
      if (slot === correctSlot) correctIndex = options.length;
      options.push(value.trim());
    }
  }

  return { ...base, options, correctIndex };
}
