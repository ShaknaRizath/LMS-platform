"use client";

import { useActionState } from "react";
import { requestLeave } from "@/lib/actions/staff/leave.actions";
import { LEAVE_TYPE_OPTIONS } from "@/lib/validation/leave-request.schema";
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

const LEAVE_TYPE_LABELS: Record<(typeof LEAVE_TYPE_OPTIONS)[number], string> = {
  ANNUAL: "Annual",
  SICK: "Sick",
  UNPAID: "Unpaid",
  OTHER: "Other",
};

export function LeaveRequestForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(requestLeave, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="type">Leave type</FieldLabel>
            <Select
              name="type"
              defaultValue="ANNUAL"
              items={LEAVE_TYPE_OPTIONS.map((type) => ({ value: type, label: LEAVE_TYPE_LABELS[type] }))}
            >
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {LEAVE_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={state?.fieldErrors?.type?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="startDate">Start date</FieldLabel>
            <Input id="startDate" name="startDate" type="date" required />
            <FieldError errors={state?.fieldErrors?.startDate?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="endDate">End date</FieldLabel>
            <Input id="endDate" name="endDate" type="date" required />
            <FieldError errors={state?.fieldErrors?.endDate?.map((message) => ({ message }))} />
          </Field>
        </Field>
        <Field>
          <FieldLabel htmlFor="reason">Reason</FieldLabel>
          <Textarea id="reason" name="reason" placeholder="Brief reason for the request" required />
          <FieldError errors={state?.fieldErrors?.reason?.map((message) => ({ message }))} />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Submitting..." : "Request leave"}
        </Button>
      </FieldGroup>
    </form>
  );
}
