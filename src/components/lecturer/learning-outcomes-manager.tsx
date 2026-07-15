"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import {
  createLearningOutcome,
  deleteLearningOutcome,
} from "@/lib/actions/lecturer/learning-outcome.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function LearningOutcomesManager({
  moduleId,
  outcomes,
}: {
  moduleId: string;
  outcomes: { id: string; code: string; description: string }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createLearningOutcome.bind(null, moduleId),
    undefined
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Learning outcomes</CardTitle>
        <CardDescription>Tag quizzes and exams against these when you create them.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {outcomes.length > 0 && (
          <ul className="flex flex-col gap-2">
            {outcomes.map((outcome) => (
              <li
                key={outcome.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <span className="text-sm">
                  <span className="font-medium">{outcome.code}</span> — {outcome.description}
                </span>
                <form action={deleteLearningOutcome.bind(null, outcome.id, moduleId)}>
                  <Button type="submit" variant="ghost" size="sm">
                    Remove
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
          <FieldGroup>
            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor="code">Code</FieldLabel>
                <Input id="code" name="code" placeholder="e.g. LO1" className="w-32" required />
                <FieldError errors={state?.fieldErrors?.code?.map((message) => ({ message }))} />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Input id="description" name="description" placeholder="e.g. Design a normalized database schema" required />
                <FieldError errors={state?.fieldErrors?.description?.map((message) => ({ message }))} />
              </Field>
            </Field>
            {state?.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending} className="self-start">
              {pending ? "Adding..." : "Add outcome"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
