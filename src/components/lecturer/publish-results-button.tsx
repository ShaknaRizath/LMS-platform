"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { publishAttemptResults } from "@/lib/actions/lecturer/quiz.actions";

export function PublishResultsButton({ attemptId, quizId }: { attemptId: string; quizId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    publishAttemptResults.bind(null, attemptId, quizId),
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Publishing..." : "Publish results to student"}
      </Button>
      {state?.error && <FieldError>{state.error}</FieldError>}
    </form>
  );
}
