"use client";

import { useActionState } from "react";
import { DAYS_OF_WEEK } from "@/lib/validation/class-session.schema";
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

const DAY_LABELS: Record<(typeof DAYS_OF_WEEK)[number], string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export function ClassSessionForm({
  lecturers,
  action,
  defaultValues,
  submitLabel = "Add session",
  pendingLabel = "Adding...",
}: {
  lecturers: { id: string; firstName: string; lastName: string }[];
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    dayOfWeek: (typeof DAYS_OF_WEEK)[number];
    startTime: string;
    endTime: string;
    room: string;
    lecturerId: string;
  };
  submitLabel?: string;
  pendingLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  if (lecturers.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Assign a lecturer to this module before scheduling class sessions.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="dayOfWeek">Day</FieldLabel>
            <Select
              name="dayOfWeek"
              defaultValue={defaultValues?.dayOfWeek ?? "MONDAY"}
              items={DAYS_OF_WEEK.map((day) => ({ value: day, label: DAY_LABELS[day] }))}
            >
              <SelectTrigger id="dayOfWeek" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS_OF_WEEK.map((day) => (
                  <SelectItem key={day} value={day}>
                    {DAY_LABELS[day]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="lecturerId">Lecturer</FieldLabel>
            <Select
              name="lecturerId"
              defaultValue={defaultValues?.lecturerId}
              items={lecturers.map((lecturer) => ({
                value: lecturer.id,
                label: `${lecturer.firstName} ${lecturer.lastName}`,
              }))}
            >
              <SelectTrigger id="lecturerId" className="w-full">
                <SelectValue placeholder="Select a lecturer" />
              </SelectTrigger>
              <SelectContent>
                {lecturers.map((lecturer) => (
                  <SelectItem key={lecturer.id} value={lecturer.id}>
                    {lecturer.firstName} {lecturer.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={state?.fieldErrors?.lecturerId?.map((message) => ({ message }))} />
          </Field>
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="startTime">Start time</FieldLabel>
            <Input
              id="startTime"
              name="startTime"
              type="time"
              defaultValue={defaultValues?.startTime}
              required
            />
            <FieldError errors={state?.fieldErrors?.startTime?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="endTime">End time</FieldLabel>
            <Input
              id="endTime"
              name="endTime"
              type="time"
              defaultValue={defaultValues?.endTime}
              required
            />
            <FieldError errors={state?.fieldErrors?.endTime?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="room">Room</FieldLabel>
            <Input
              id="room"
              name="room"
              placeholder="e.g. Lab 2"
              defaultValue={defaultValues?.room}
              required
            />
            <FieldError errors={state?.fieldErrors?.room?.map((message) => ({ message }))} />
          </Field>
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? pendingLabel : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
