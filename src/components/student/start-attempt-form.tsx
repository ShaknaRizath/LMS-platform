"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

export function StartAttemptForm({
  action,
  label,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  label: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      {state?.error && <FieldError>{state.error}</FieldError>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Starting..." : label}
      </Button>
    </form>
  );
}
