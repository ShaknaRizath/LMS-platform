"use client";

import { useActionState } from "react";
import { approveApplication } from "@/lib/actions/admissions/application.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

export function ApproveApplicationButton({ applicationId }: { applicationId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    approveApplication.bind(null, applicationId),
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-1">
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Approving..." : "Approve"}
      </Button>
      {state?.error && <FieldError>{state.error}</FieldError>}
    </form>
  );
}
