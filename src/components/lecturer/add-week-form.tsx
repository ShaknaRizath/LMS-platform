"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function AddWeekForm({
  action,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4">
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="weekNumber">Week number</FieldLabel>
            <Input id="weekNumber" name="weekNumber" type="number" min={1} required />
            <FieldError errors={state?.fieldErrors?.weekNumber?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="title">Title (optional)</FieldLabel>
            <Input id="title" name="title" placeholder="Introduction" />
          </Field>
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Adding..." : "Add week"}
        </Button>
      </FieldGroup>
    </form>
  );
}
