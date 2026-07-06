"use client";

import { useActionState } from "react";
import { createCalendarEvent } from "@/lib/actions/admin/calendar.actions";
import { CALENDAR_EVENT_TYPES } from "@/lib/validation/calendar-event.schema";
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

const TYPE_LABELS: Record<(typeof CALENDAR_EVENT_TYPES)[number], string> = {
  SEMESTER_START: "Semester start",
  SEMESTER_END: "Semester end",
  EXAM_PERIOD: "Exam period",
  HOLIDAY: "Holiday",
  DEADLINE: "Deadline",
  OTHER: "Other",
};

export function CalendarEventForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createCalendarEvent,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input id="title" name="title" required />
            <FieldError errors={state?.fieldErrors?.title?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="type">Type</FieldLabel>
            <Select name="type" defaultValue="OTHER">
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CALENDAR_EVENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="startDate">Start date</FieldLabel>
            <Input id="startDate" name="startDate" type="date" required />
            <FieldError errors={state?.fieldErrors?.startDate?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="endDate">End date (optional)</FieldLabel>
            <Input id="endDate" name="endDate" type="date" />
          </Field>
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Adding..." : "Add event"}
        </Button>
      </FieldGroup>
    </form>
  );
}
