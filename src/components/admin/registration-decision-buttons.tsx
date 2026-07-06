"use client";

import { useActionState, useState, useTransition } from "react";
import { approveRegistration, rejectRegistration } from "@/lib/actions/admin/registration.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function ApproveRegistrationButton({ registrationId }: { registrationId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await approveRegistration(registrationId);
            setError(result?.error ?? null);
          })
        }
      >
        {pending ? "Approving..." : "Approve registration"}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function RejectRegistrationDialog({ registrationId }: { registrationId: string }) {
  const [open, setOpen] = useState(false);

  async function wrappedAction(prevState: ActionState, formData: FormData) {
    const result = await rejectRegistration(registrationId, prevState, formData);
    if (!result?.error && !result?.fieldErrors) {
      setOpen(false);
    }
    return result;
  }

  const [state, formAction, pending] = useActionState<ActionState, FormData>(wrappedAction, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline">
            Reject registration
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject this registration</DialogTitle>
        </DialogHeader>
        <form action={formAction}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="reason">Reason</FieldLabel>
              <Textarea id="reason" name="reason" rows={3} required />
              <FieldError errors={state?.fieldErrors?.reason?.map((message) => ({ message }))} />
            </Field>
            {state?.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? "Rejecting..." : "Reject"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
