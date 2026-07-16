"use client";

import { useActionState } from "react";
import { applyForScholarship } from "@/lib/actions/student/scholarship.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function ScholarshipApplicationForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(applyForScholarship, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="reason">Reason</FieldLabel>
          <Textarea id="reason" name="reason" placeholder="Why are you applying for a scholarship?" required />
          <FieldError errors={state?.fieldErrors?.reason?.map((message) => ({ message }))} />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Submitting..." : "Apply for scholarship"}
        </Button>
      </FieldGroup>
    </form>
  );
}
