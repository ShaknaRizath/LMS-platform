"use client";

import { useActionState } from "react";
import { setQuizLearningOutcomes } from "@/lib/actions/lecturer/learning-outcome.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field";

export function QuizOutcomesForm({
  quizId,
  moduleId,
  outcomes,
  taggedOutcomeIds,
}: {
  quizId: string;
  moduleId: string;
  outcomes: { id: string; code: string; description: string }[];
  taggedOutcomeIds: string[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    setQuizLearningOutcomes.bind(null, quizId, moduleId),
    undefined
  );
  const taggedSet = new Set(taggedOutcomeIds);

  if (outcomes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No learning outcomes defined for this module yet — add some from the Exams list page.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {outcomes.map((outcome) => (
          <label key={outcome.id} className="flex items-start gap-2 text-sm">
            <Checkbox
              key={`${outcome.id}-${taggedSet.has(outcome.id)}`}
              name="outcomeIds"
              value={outcome.id}
              defaultChecked={taggedSet.has(outcome.id)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">{outcome.code}</span> — {outcome.description}
            </span>
          </label>
        ))}
      </div>
      {state?.error && <FieldError>{state.error}</FieldError>}
      <Button type="submit" variant="outline" size="sm" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save outcomes"}
      </Button>
    </form>
  );
}
