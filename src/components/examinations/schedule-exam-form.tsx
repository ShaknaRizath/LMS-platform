"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function ScheduleExamForm({
  quizId,
  invigilators,
  action,
}: {
  quizId: string;
  invigilators: { id: string; firstName: string; lastName: string }[];
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor={`availableFrom-${quizId}`}>Start</FieldLabel>
            <Input id={`availableFrom-${quizId}`} name="availableFrom" type="datetime-local" required />
            <FieldError errors={state?.fieldErrors?.availableFrom?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor={`availableUntil-${quizId}`}>End</FieldLabel>
            <Input id={`availableUntil-${quizId}`} name="availableUntil" type="datetime-local" required />
            <FieldError errors={state?.fieldErrors?.availableUntil?.map((message) => ({ message }))} />
          </Field>
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor={`venue-${quizId}`}>Venue</FieldLabel>
            <Input id={`venue-${quizId}`} name="venue" placeholder="e.g. Hall A" required />
            <FieldError errors={state?.fieldErrors?.venue?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor={`invigilatorId-${quizId}`}>Invigilator</FieldLabel>
            <Select
              name="invigilatorId"
              items={invigilators.map((lecturer) => ({
                value: lecturer.id,
                label: `${lecturer.firstName} ${lecturer.lastName}`,
              }))}
            >
              <SelectTrigger id={`invigilatorId-${quizId}`} className="w-full">
                <SelectValue placeholder="Select an invigilator" />
              </SelectTrigger>
              <SelectContent>
                {invigilators.map((lecturer) => (
                  <SelectItem key={lecturer.id} value={lecturer.id}>
                    {lecturer.firstName} {lecturer.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={state?.fieldErrors?.invigilatorId?.map((message) => ({ message }))} />
          </Field>
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Scheduling..." : "Schedule"}
        </Button>
      </FieldGroup>
    </form>
  );
}
