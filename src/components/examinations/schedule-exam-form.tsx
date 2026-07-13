"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function ScheduleExamForm({
  quizId,
  action,
}: {
  quizId: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor={`availableFrom-${quizId}`}>Start</FieldLabel>
            <Input id={`availableFrom-${quizId}`} name="availableFrom" type="datetime-local" required />
            <FieldError errors={state?.fieldErrors?.availableFrom?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor={`availableUntil-${quizId}`}>End</FieldLabel>
            <Input id={`availableUntil-${quizId}`} name="availableUntil" type="datetime-local" required />
            <FieldError errors={state?.fieldErrors?.availableUntil?.map((message) => ({ message }))} />
          </Field>
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Scheduling..." : "Schedule"}
        </Button>
      </FieldGroup>
    </form>
  );
}
