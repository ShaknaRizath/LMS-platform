"use client";

import { useActionState, useState } from "react";
import { rejectApplication } from "@/lib/actions/admissions/application.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function RejectApplicationDialog({ applicationId }: { applicationId: string }) {
  const [open, setOpen] = useState(false);

  async function wrappedAction(prevState: ActionState, formData: FormData) {
    const result = await rejectApplication(applicationId, prevState, formData);
    if (!result?.error && !result?.fieldErrors) setOpen(false);
    return result;
  }
  const [state, formAction, pending] = useActionState<ActionState, FormData>(wrappedAction, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm">Reject</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject application</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <Field>
            <FieldLabel htmlFor="reason">Reason</FieldLabel>
            <Textarea id="reason" name="reason" rows={3} required />
            <FieldError errors={state?.fieldErrors?.reason?.map((message) => ({ message }))} />
          </Field>
          {state?.error && <FieldError>{state.error}</FieldError>}
          <Button type="submit" variant="destructive" disabled={pending}>
            {pending ? "Rejecting..." : "Reject application"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
