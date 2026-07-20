"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { gradeEssayAnswer } from "@/lib/actions/lecturer/quiz.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldError } from "@/components/ui/field";

export function EssayGradeForm({
  answerId,
  quizId,
  maxPoints,
  currentPoints,
  locked = false,
}: {
  answerId: string;
  quizId: string;
  maxPoints: number;
  currentPoints: number | null;
  locked?: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    gradeEssayAnswer.bind(null, answerId, quizId),
    undefined
  );

  if (locked) {
    return <p className="text-sm text-muted-foreground">Marks are locked — grading is disabled.</p>;
  }

  return (
    <form action={formAction} className="flex items-end gap-2">
      <div>
        <Input
          name="pointsAwarded"
          type="number"
          min={0}
          max={maxPoints}
          defaultValue={currentPoints ?? ""}
          placeholder={`0-${maxPoints}`}
          className="w-24"
          required
        />
        <FieldError errors={state?.fieldErrors?.pointsAwarded?.map((message) => ({ message }))} />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Saving..." : currentPoints != null ? "Update" : "Award points"}
      </Button>
      {state?.error && <FieldError>{state.error}</FieldError>}
    </form>
  );
}
