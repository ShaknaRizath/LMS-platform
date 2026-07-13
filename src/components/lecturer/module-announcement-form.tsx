"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export function ModuleAnnouncementForm({
  action,
  defaultValues,
  submitLabel = "Post announcement",
  pendingLabel = "Posting...",
  onSuccess,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: { title: string; body: string; isPinned: boolean };
  submitLabel?: string;
  pendingLabel?: string;
  onSuccess?: () => void;
}) {
  async function wrappedAction(prevState: ActionState, formData: FormData) {
    const result = await action(prevState, formData);
    if (!result?.error && !result?.fieldErrors) {
      onSuccess?.();
    }
    return result;
  }

  const [state, formAction, pending] = useActionState<ActionState, FormData>(wrappedAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input id="title" name="title" defaultValue={defaultValues?.title} required />
          <FieldError errors={state?.fieldErrors?.title?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="body">Message</FieldLabel>
          <Textarea id="body" name="body" rows={4} defaultValue={defaultValues?.body} required />
          <FieldError errors={state?.fieldErrors?.body?.map((message) => ({ message }))} />
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="isPinned" name="isPinned" value="true" defaultChecked={defaultValues?.isPinned} />
          <FieldLabel htmlFor="isPinned" className="font-normal">
            Pin this announcement
          </FieldLabel>
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? pendingLabel : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
