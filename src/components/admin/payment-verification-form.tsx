"use client";

import { useActionState } from "react";
import { verifyPayment } from "@/lib/actions/admin/registration.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function PaymentVerificationForm({
  paymentRecordId,
  registrationId,
}: {
  paymentRecordId: string;
  registrationId: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    verifyPayment.bind(null, paymentRecordId, registrationId),
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`notes-${paymentRecordId}`}>Notes (required if rejecting)</FieldLabel>
          <Textarea id={`notes-${paymentRecordId}`} name="notes" rows={2} />
          <FieldError errors={state?.fieldErrors?.notes?.map((message) => ({ message }))} />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <div className="flex gap-2">
          <Button
            type="submit"
            name="decision"
            value="VERIFIED"
            disabled={pending}
          >
            Verify payment
          </Button>
          <Button
            type="submit"
            name="decision"
            value="REJECTED"
            variant="outline"
            disabled={pending}
          >
            Reject payment
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
