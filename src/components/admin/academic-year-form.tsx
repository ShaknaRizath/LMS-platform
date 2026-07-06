"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

function toDateInputValue(date?: Date) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function AcademicYearForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: { name: string; startDate: Date; endDate: Date };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input id="name" name="name" placeholder="2025/2026" defaultValue={defaultValues?.name} required />
          <FieldError errors={state?.fieldErrors?.name?.map((message) => ({ message }))} />
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="startDate">Start date</FieldLabel>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={toDateInputValue(defaultValues?.startDate)}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="endDate">End date</FieldLabel>
            <Input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={toDateInputValue(defaultValues?.endDate)}
              required
            />
            <FieldError errors={state?.fieldErrors?.endDate?.map((message) => ({ message }))} />
          </Field>
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
