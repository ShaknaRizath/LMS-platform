"use client";

import { useActionState, useState } from "react";
import { Download } from "lucide-react";
import type { ActionState } from "@/lib/actions/action-state";
import { useFileUpload } from "@/lib/storage/use-file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldError, FieldDescription } from "@/components/ui/field";
import { QuizTimer } from "@/components/student/quiz-timer";

export type QuizTakeQuestion = {
  id: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  prompt: string;
  points: number;
  options: { id: string; text: string }[];
  promptFileUrl: string | null;
  promptFileName: string | null;
  answerFormat: "TEXT" | "FILE";
};

function FileAnswerField({ questionId, studentId }: { questionId: string; studentId: string }) {
  const [file, setFile] = useState<{ url: string; name: string } | null>(null);
  const { upload, uploading, error } = useFileUpload();

  return (
    <div className="mt-2 flex flex-col gap-1">
      <input type="hidden" name={`question_${questionId}_fileUrl`} value={file?.url ?? ""} />
      <input type="hidden" name={`question_${questionId}_fileName`} value={file?.name ?? ""} />
      <Input
        type="file"
        disabled={uploading}
        onChange={async (e) => {
          const selected = e.target.files?.[0];
          if (!selected) return;
          const result = await upload(selected, `submissions/${studentId}`);
          if (result) setFile({ url: result.url, name: result.fileName });
        }}
      />
      <FieldDescription>Upload your answer as a document, spreadsheet, or image.</FieldDescription>
      {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
      {file && !uploading && <p className="text-sm text-muted-foreground">Uploaded: {file.name}</p>}
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

export function QuizTakeForm({
  action,
  questions,
  deadline,
  studentId,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  questions: QuizTakeQuestion[];
  deadline: Date | null;
  studentId: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {deadline && <QuizTimer deadline={deadline} />}
      {questions.map((question, index) => (
        <div key={question.id} className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-medium">
            {index + 1}. {question.prompt}{" "}
            <span className="text-xs text-muted-foreground">
              ({question.points} pt{question.points === 1 ? "" : "s"})
            </span>
          </p>
          {question.promptFileUrl && (
            <a
              href={question.promptFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex w-fit items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Download className="size-3.5" />
              {question.promptFileName ?? "Attached file"}
            </a>
          )}
          {question.type === "ESSAY" ? (
            question.answerFormat === "FILE" ? (
              <FileAnswerField questionId={question.id} studentId={studentId} />
            ) : (
              <Textarea
                name={`question_${question.id}`}
                rows={4}
                className="mt-2"
                placeholder="Type your answer here..."
              />
            )
          ) : (
            <div className="mt-2 flex flex-col gap-2">
              {question.options.map((option) => (
                <label key={option.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    value={option.id}
                    className="size-4 accent-primary"
                  />
                  {option.text}
                </label>
              ))}
            </div>
          )}
        </div>
      ))}
      {state?.error && <FieldError>{state.error}</FieldError>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}
