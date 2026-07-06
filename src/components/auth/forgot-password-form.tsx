"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordReset,
  type RequestResetState,
} from "@/lib/actions/auth/reset-password.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<RequestResetState, FormData>(
    requestPasswordReset,
    undefined
  );

  if (state?.submitted) {
    return (
      <p className="text-sm text-muted-foreground">
        If an account exists for that email, we&apos;ve sent a link to reset
        your password. Return to{" "}
        <Link href="/login" className="underline underline-offset-4">
          sign in
        </Link>
        .
      </p>
    );
  }

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" required autoComplete="email" />
          <FieldDescription>
            We&apos;ll email you a link to reset your password.
          </FieldDescription>
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Sending..." : "Send reset link"}
        </Button>
      </FieldGroup>
    </form>
  );
}
