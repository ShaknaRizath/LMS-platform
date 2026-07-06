"use client";

import { useActionState } from "react";
import {
  completePasswordReset,
} from "@/lib/actions/auth/reset-password.action";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    completePasswordReset,
    undefined
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="token" value={token} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <Input id="password" name="password" type="password" required autoComplete="new-password" />
          <FieldError errors={state?.fieldErrors?.password?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
          />
          <FieldError
            errors={state?.fieldErrors?.confirmPassword?.map((message) => ({ message }))}
          />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving..." : "Set password"}
        </Button>
      </FieldGroup>
    </form>
  );
}
