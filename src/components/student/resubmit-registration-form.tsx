"use client";

import { useActionState } from "react";
import { resubmitRegistration } from "@/lib/actions/student/registration.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

export function ResubmitRegistrationForm({
  registrationId,
  modules,
}: {
  registrationId: string;
  modules: { id: string; code: string; title: string }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    resubmitRegistration.bind(null, registrationId),
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-sm font-medium">These modules will be resubmitted:</p>
        <ul className="flex flex-col gap-1">
          {modules.map((module) => (
            <li key={module.id} className="text-sm">
              {module.code} — {module.title}
            </li>
          ))}
        </ul>
      </div>
      {state?.error && <FieldError>{state.error}</FieldError>}
      <Button type="submit" disabled={pending}>
        {pending ? "Resubmitting..." : "Resubmit registration"}
      </Button>
    </form>
  );
}
