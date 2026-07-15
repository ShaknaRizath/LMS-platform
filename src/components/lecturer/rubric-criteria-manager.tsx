"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import {
  createRubricCriterion,
  deleteRubricCriterion,
} from "@/lib/actions/lecturer/rubric.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function RubricCriteriaManager({
  quizId,
  criteria,
  canEdit,
}: {
  quizId: string;
  criteria: { id: string; name: string; maxPoints: number }[];
  canEdit: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createRubricCriterion.bind(null, quizId),
    undefined
  );

  const totalPoints = criteria.reduce((sum, c) => sum + c.maxPoints, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rubric criteria</CardTitle>
        <CardDescription>
          {criteria.length === 0
            ? "Add at least one criterion before publishing."
            : `${totalPoints} points total across ${criteria.length} criteri${criteria.length === 1 ? "on" : "a"}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {criteria.length > 0 && (
          <ul className="flex flex-col gap-2">
            {criteria.map((criterion) => (
              <li
                key={criterion.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <span className="text-sm">
                  {criterion.name} · {criterion.maxPoints} pt{criterion.maxPoints === 1 ? "" : "s"}
                </span>
                {canEdit && (
                  <form action={deleteRubricCriterion.bind(null, criterion.id, quizId)}>
                    <Button type="submit" variant="ghost" size="sm">
                      Remove
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}

        {canEdit && (
          <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
            <FieldGroup>
              <Field orientation="responsive">
                <Field>
                  <FieldLabel htmlFor="name">Criterion name</FieldLabel>
                  <Input id="name" name="name" placeholder="e.g. Technique" required />
                  <FieldError errors={state?.fieldErrors?.name?.map((message) => ({ message }))} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="maxPoints">Max points</FieldLabel>
                  <Input id="maxPoints" name="maxPoints" type="number" min={1} required />
                  <FieldError errors={state?.fieldErrors?.maxPoints?.map((message) => ({ message }))} />
                </Field>
              </Field>
              {state?.error && <FieldError>{state.error}</FieldError>}
              <Button type="submit" disabled={pending} className="self-start">
                {pending ? "Adding..." : "Add criterion"}
              </Button>
            </FieldGroup>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
