"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FieldError } from "@/components/ui/field";
import { QuizTimer } from "@/components/student/quiz-timer";

export type QuizTakeQuestion = {
  id: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  prompt: string;
  points: number;
  options: { id: string; text: string }[];
};

export function QuizTakeForm({
  action,
  questions,
  deadline,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  questions: QuizTakeQuestion[];
  deadline: Date | null;
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
          {question.type === "ESSAY" ? (
            <Textarea
              name={`question_${question.id}`}
              rows={4}
              className="mt-2"
              placeholder="Type your answer here..."
            />
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
