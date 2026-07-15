"use client";

import { useActionState } from "react";
import { submitApplication } from "@/lib/actions/admissions/application.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function ApplicationForm({ programs }: { programs: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    submitApplication,
    undefined
  );

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input id="firstName" name="firstName" required className="h-11 rounded-full px-4" />
            <FieldError errors={state?.fieldErrors?.firstName?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input id="lastName" name="lastName" required className="h-11 rounded-full px-4" />
            <FieldError errors={state?.fieldErrors?.lastName?.map((message) => ({ message }))} />
          </Field>
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email address</FieldLabel>
          <Input id="email" name="email" type="email" required className="h-11 rounded-full px-4" />
          <FieldError errors={state?.fieldErrors?.email?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">Phone (optional)</FieldLabel>
          <Input id="phone" name="phone" type="tel" className="h-11 rounded-full px-4" />
        </Field>
        <Field>
          <FieldLabel htmlFor="programId">Program</FieldLabel>
          <Select
            name="programId"
            items={programs.map((program) => ({ value: program.id, label: program.name }))}
          >
            <SelectTrigger id="programId" className="w-full rounded-full">
              <SelectValue placeholder="Select a program" />
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
        <Field>
          <FieldLabel htmlFor="statement">Why do you want to join? (optional)</FieldLabel>
          <Textarea id="statement" name="statement" rows={3} />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="h-11 w-full rounded-full">
          {pending ? "Submitting..." : "Submit application"}
        </Button>
      </FieldGroup>
    </form>
  );
}
