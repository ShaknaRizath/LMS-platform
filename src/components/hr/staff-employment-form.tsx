"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { EMPLOYMENT_TYPE_OPTIONS } from "@/lib/validation/staff-employment.schema";
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

const EMPLOYMENT_TYPE_LABELS: Record<(typeof EMPLOYMENT_TYPE_OPTIONS)[number], string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  VISITING: "Visiting",
};

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function StaffEmploymentForm({
  userId,
  action,
  defaultValues,
}: {
  userId: string;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues: {
    jobTitle: string | null;
    department: string | null;
    employmentType: string | null;
    startDate: Date | null;
    contractEndDate: Date | null;
  };
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} key={userId} className="flex flex-col gap-4">
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="jobTitle">Job title</FieldLabel>
            <Input id="jobTitle" name="jobTitle" defaultValue={defaultValues.jobTitle ?? ""} />
            <FieldError errors={state?.fieldErrors?.jobTitle?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="department">Department</FieldLabel>
            <Input id="department" name="department" defaultValue={defaultValues.department ?? ""} />
            <FieldError errors={state?.fieldErrors?.department?.map((message) => ({ message }))} />
          </Field>
        </Field>

        <Field>
          <FieldLabel htmlFor="employmentType">Employment type</FieldLabel>
          <Select
            name="employmentType"
            defaultValue={defaultValues.employmentType ?? undefined}
            items={EMPLOYMENT_TYPE_OPTIONS.map((type) => ({ value: type, label: EMPLOYMENT_TYPE_LABELS[type] }))}
          >
            <SelectTrigger id="employmentType" className="w-full">
              <SelectValue placeholder="Not set" />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPE_OPTIONS.map((type) => (
                <SelectItem key={type} value={type}>
                  {EMPLOYMENT_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={state?.fieldErrors?.employmentType?.map((message) => ({ message }))} />
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="startDate">Start date</FieldLabel>
            <Input id="startDate" name="startDate" type="date" defaultValue={toDateInputValue(defaultValues.startDate)} />
            <FieldError errors={state?.fieldErrors?.startDate?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="contractEndDate">Contract end date</FieldLabel>
            <Input
              id="contractEndDate"
              name="contractEndDate"
              type="date"
              defaultValue={toDateInputValue(defaultValues.contractEndDate)}
            />
            <FieldError errors={state?.fieldErrors?.contractEndDate?.map((message) => ({ message }))} />
          </Field>
        </Field>

        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Saving..." : "Save employment details"}
        </Button>
      </FieldGroup>
    </form>
  );
}
