"use client";

import { useActionState } from "react";
import { resubmitRegistration } from "@/lib/actions/student/registration.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function ResubmitRegistrationForm({
  registrationId,
  modules,
  currentModuleIds,
}: {
  registrationId: string;
  modules: { id: string; code: string; title: string }[];
  currentModuleIds: string[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    resubmitRegistration.bind(null, registrationId),
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel>Select modules</FieldLabel>
          <div className="flex flex-col gap-2">
            {modules.map((module) => (
              <Field key={module.id} orientation="horizontal">
                <Checkbox
                  id={`resubmit-module-${module.id}`}
                  name="moduleIds"
                  value={module.id}
                  defaultChecked={currentModuleIds.includes(module.id)}
                />
                <FieldLabel htmlFor={`resubmit-module-${module.id}`} className="font-normal">
                  {module.code} — {module.title}
                </FieldLabel>
              </Field>
            ))}
          </div>
          <FieldError errors={state?.fieldErrors?.moduleIds?.map((message) => ({ message }))} />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending}>
          {pending ? "Resubmitting..." : "Resubmit registration"}
        </Button>
      </FieldGroup>
    </form>
  );
}
