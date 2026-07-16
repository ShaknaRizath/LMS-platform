"use client";

import { useActionState } from "react";
import { fileDisciplineCase } from "@/lib/actions/coordinator/discipline.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function DisciplineCaseForm({ studentId }: { studentId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    fileDisciplineCase.bind(null, studentId),
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="incidentDate">Incident date</FieldLabel>
          <Input id="incidentDate" name="incidentDate" type="date" required />
          <FieldError errors={state?.fieldErrors?.incidentDate?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea id="description" name="description" placeholder="What happened?" required />
          <FieldError errors={state?.fieldErrors?.description?.map((message) => ({ message }))} />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Filing..." : "File case"}
        </Button>
      </FieldGroup>
    </form>
  );
}
