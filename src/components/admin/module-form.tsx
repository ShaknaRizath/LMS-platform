"use client";

import { useActionState } from "react";
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

export type ModuleFormOptions = {
  programs: { id: string; name: string }[];
  semesters: { id: string; name: string; academicYearName: string }[];
};

export function ModuleForm({
  action,
  options,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  options: ModuleFormOptions;
  defaultValues?: {
    code: string;
    title: string;
    description: string | null;
    credits: number | null;
    yearLevel: number;
    capacity: number | null;
    programId: string;
    semesterId: string;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="code">Code</FieldLabel>
            <Input id="code" name="code" defaultValue={defaultValues?.code} placeholder="CS101" required />
            <FieldError errors={state?.fieldErrors?.code?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="title">Title</FieldLabel>
            <Input id="title" name="title" defaultValue={defaultValues?.title} required />
            <FieldError errors={state?.fieldErrors?.title?.map((message) => ({ message }))} />
          </Field>
        </Field>

        <Field>
          <FieldLabel htmlFor="programId">Program</FieldLabel>
          <Select
            name="programId"
            defaultValue={defaultValues?.programId}
            items={options.programs.map((program) => ({ value: program.id, label: program.name }))}
          >
            <SelectTrigger id="programId" className="w-full">
              <SelectValue placeholder="Select a program" />
            </SelectTrigger>
            <SelectContent>
              {options.programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={state?.fieldErrors?.programId?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="semesterId">Semester</FieldLabel>
          <Select
            name="semesterId"
            defaultValue={defaultValues?.semesterId}
            items={options.semesters.map((semester) => ({
              value: semester.id,
              label: `${semester.academicYearName} — ${semester.name}`,
            }))}
          >
            <SelectTrigger id="semesterId" className="w-full">
              <SelectValue placeholder="Select a semester" />
            </SelectTrigger>
            <SelectContent>
              {options.semesters.map((semester) => (
                <SelectItem key={semester.id} value={semester.id}>
                  {semester.academicYearName} — {semester.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={state?.fieldErrors?.semesterId?.map((message) => ({ message }))} />
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="yearLevel">Year level</FieldLabel>
            <Input
              id="yearLevel"
              name="yearLevel"
              type="number"
              min={1}
              max={6}
              defaultValue={defaultValues?.yearLevel}
              required
            />
            <FieldError errors={state?.fieldErrors?.yearLevel?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="credits">Credits</FieldLabel>
            <Input id="credits" name="credits" type="number" min={0} defaultValue={defaultValues?.credits ?? ""} />
          </Field>
          <Field>
            <FieldLabel htmlFor="capacity">Capacity</FieldLabel>
            <Input id="capacity" name="capacity" type="number" min={1} defaultValue={defaultValues?.capacity ?? ""} />
          </Field>
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea id="description" name="description" defaultValue={defaultValues?.description ?? ""} rows={3} />
        </Field>

        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
