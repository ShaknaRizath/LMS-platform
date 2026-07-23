"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup, type SignupState } from "@/lib/actions/auth/signup.action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
  FieldSeparator,
} from "@/components/ui/field";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export function SignupForm({ programs }: { programs: { id: string; name: string }[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<SignupState, FormData>(
    signup,
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
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input
            id="name"
            name="name"
            placeholder="Enter your name"
            required
            className="h-11 rounded-full px-4"
          />
          <FieldError errors={state?.fieldErrors?.name?.map((message) => ({ message }))} />
        </Field>
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
          <FieldError errors={state?.fieldErrors?.email?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            required
            autoComplete="new-password"
            className="h-11 rounded-full px-4"
          />
          <FieldError errors={state?.fieldErrors?.password?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="programId">Program</FieldLabel>
          <Select
            name="programId"
            items={programs.map((program) => ({ value: program.id, label: program.name }))}
          >
            <SelectTrigger id="programId" className="w-full rounded-full">
              <SelectValue placeholder="Select your program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={state?.fieldErrors?.programId?.map((message) => ({ message }))} />
        </Field>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox name="agreeToTerms" value="on" required className="mt-0.5" />
          <span>
            I agree to the <span className="underline underline-offset-4">terms &amp; policy</span>
          </span>
        </label>
        <FieldError errors={state?.fieldErrors?.agreeToTerms?.map((message) => ({ message }))} />
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="h-11 w-full rounded-full">
          {pending ? "Creating account..." : "Signup"}
        </Button>
        <FieldSeparator>Or</FieldSeparator>
        <OAuthButtons />
        <p className="text-center text-sm text-muted-foreground">
          Have an account?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </FieldGroup>
    </form>
  );
}
