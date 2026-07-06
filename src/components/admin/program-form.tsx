"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function ProgramForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    name: string;
    code: string;
    description: string | null;
    durationYears: number;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Program name</FieldLabel>
          <Input id="name" name="name" defaultValue={defaultValues?.name} required />
          <FieldError errors={state?.fieldErrors?.name?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="code">Code</FieldLabel>
          <Input id="code" name="code" defaultValue={defaultValues?.code} placeholder="BSC-CS" required />
          <FieldError errors={state?.fieldErrors?.code?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="durationYears">Duration (years)</FieldLabel>
          <Input
            id="durationYears"
            name="durationYears"
            type="number"
            min={1}
            max={10}
            defaultValue={defaultValues?.durationYears}
            required
          />
          <FieldError errors={state?.fieldErrors?.durationYears?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea id="description" name="description" defaultValue={defaultValues?.description ?? ""} rows={3} />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
