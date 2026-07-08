"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

function toDateInputValue(date?: Date | null) {
  return date ? date.toISOString().slice(0, 10) : "";
}

export function SemesterForm({
  action,
  defaultValues,
  submitLabel = "Add semester",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    name: string;
    semesterNumber: number;
    startDate: Date;
    endDate: Date;
    registrationOpensAt: Date | null;
    registrationClosesAt: Date | null;
    feeAmount: string | number | null;
  };
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="name">Semester name</FieldLabel>
            <Input id="name" name="name" placeholder="Semester 1" defaultValue={defaultValues?.name} required />
          </Field>
          <Field>
            <FieldLabel htmlFor="semesterNumber">Number</FieldLabel>
            <Input
              id="semesterNumber"
              name="semesterNumber"
              type="number"
              min={1}
              max={4}
              defaultValue={defaultValues?.semesterNumber}
              required
            />
          </Field>
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
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="registrationOpensAt">Registration opens</FieldLabel>
            <Input
              id="registrationOpensAt"
              name="registrationOpensAt"
              type="date"
              defaultValue={toDateInputValue(defaultValues?.registrationOpensAt)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="registrationClosesAt">Registration closes</FieldLabel>
            <Input
              id="registrationClosesAt"
              name="registrationClosesAt"
              type="date"
              defaultValue={toDateInputValue(defaultValues?.registrationClosesAt)}
            />
          </Field>
        </Field>
        <Field>
          <FieldLabel htmlFor="feeAmount">Semester fee</FieldLabel>
          <Input
            id="feeAmount"
            name="feeAmount"
            type="number"
            min={0}
            step="0.01"
            defaultValue={defaultValues?.feeAmount ?? ""}
          />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Saving..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
