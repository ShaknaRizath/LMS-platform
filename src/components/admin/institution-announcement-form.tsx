"use client";

import { useActionState } from "react";
import { createInstitutionAnnouncement } from "@/lib/actions/admin/announcement.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function InstitutionAnnouncementForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createInstitutionAnnouncement,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input id="title" name="title" required />
          <FieldError errors={state?.fieldErrors?.title?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="body">Message</FieldLabel>
          <Textarea id="body" name="body" rows={4} required />
          <FieldError errors={state?.fieldErrors?.body?.map((message) => ({ message }))} />
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="isPinned" name="isPinned" value="true" />
          <FieldLabel htmlFor="isPinned" className="font-normal">
            Pin this announcement
          </FieldLabel>
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Posting..." : "Post institution-wide announcement"}
        </Button>
      </FieldGroup>
    </form>
  );
}
