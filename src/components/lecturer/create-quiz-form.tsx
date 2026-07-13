"use client";

import { useActionState, useState } from "react";
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

const KIND_OPTIONS = [
  { value: "QUIZ", label: "Quiz (you publish it yourself)" },
  { value: "EXAM", label: "Exam (Examination Unit schedules it)" },
];

export function CreateQuizForm({
  action,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [kind, setKind] = useState("QUIZ");
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="kind">Type</FieldLabel>
          <Select name="kind" value={kind} onValueChange={(value) => setKind(value ?? "QUIZ")} items={KIND_OPTIONS}>
            <SelectTrigger id="kind" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KIND_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input id="title" name="title" required />
          <FieldError errors={state?.fieldErrors?.title?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
          <Textarea id="description" name="description" rows={2} />
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="timeLimitMinutes">Time limit, minutes (optional)</FieldLabel>
            <Input id="timeLimitMinutes" name="timeLimitMinutes" type="number" min={1} />
            <FieldError errors={state?.fieldErrors?.timeLimitMinutes?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="maxAttempts">Max attempts</FieldLabel>
            <Input id="maxAttempts" name="maxAttempts" type="number" min={1} defaultValue={1} required />
            <FieldError errors={state?.fieldErrors?.maxAttempts?.map((message) => ({ message }))} />
          </Field>
        </Field>

        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Creating..." : kind === "EXAM" ? "Create exam" : "Create quiz"}
        </Button>
      </FieldGroup>
    </form>
  );
}
