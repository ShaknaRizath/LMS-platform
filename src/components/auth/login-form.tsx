"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, type LoginState } from "@/lib/actions/auth/login.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    login,
    undefined
  );

  useEffect(() => {
    if (state?.redirectTo) {
      router.push(state.redirectTo);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            required
            autoComplete="email"
            className="h-11 rounded-full px-4"
          />
        </Field>
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="text-sm text-muted-foreground underline underline-offset-4"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            className="h-11 rounded-full px-4"
          />
        </Field>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox name="rememberMe" defaultChecked />
          Remember for 30 days
        </label>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="h-11 w-full rounded-full">
          {pending ? "Signing in..." : "Login"}
        </Button>
        <FieldSeparator>Or</FieldSeparator>
        <OAuthButtons />
        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
            Sign Up
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
