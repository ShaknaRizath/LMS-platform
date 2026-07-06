"use client";

import { useActionState } from "react";
import { createRegistration } from "@/lib/actions/student/registration.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function RegisterForm({
  semesterId,
  modules,
}: {
  semesterId: string;
  modules: { id: string; code: string; title: string; credits: number | null }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createRegistration,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="semesterId" value={semesterId} />
      <FieldGroup>
        <Field>
          <FieldLabel>Select modules</FieldLabel>
          <div className="flex flex-col gap-2">
            {modules.map((module) => (
              <Field key={module.id} orientation="horizontal">
                <Checkbox id={`module-${module.id}`} name="moduleIds" value={module.id} />
                <FieldLabel htmlFor={`module-${module.id}`} className="font-normal">
                  {module.code} — {module.title}
                  {module.credits ? ` (${module.credits} credits)` : ""}
                </FieldLabel>
              </Field>
            ))}
          </div>
          <FieldError errors={state?.fieldErrors?.moduleIds?.map((message) => ({ message }))} />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending}>
          {pending ? "Submitting..." : "Submit registration"}
        </Button>
      </FieldGroup>
    </form>
  );
}
