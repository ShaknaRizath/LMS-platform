"use client";

import { useActionState, useState } from "react";
import { updateOwnProfile } from "@/lib/actions/shared/profile.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { AvatarUploadField } from "@/components/shared/avatar-upload-field";

export function BasicProfileForm({
  userId,
  viewHref,
  formKey,
  defaultValues,
}: {
  userId: string;
  viewHref: string;
  formKey: string | number;
  defaultValues: {
    firstName: string;
    lastName: string;
    phone: string | null;
    avatarUrl: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateOwnProfile.bind(null, viewHref),
    undefined
  );
  const [avatarUrl, setAvatarUrl] = useState(defaultValues.avatarUrl ?? "");
  const fullName = `${defaultValues.firstName} ${defaultValues.lastName}`;

  return (
    <form action={formAction} key={formKey}>
      <input type="hidden" name="avatarUrl" value={avatarUrl} />
      <FieldGroup>
        <Field>
          <FieldLabel>Profile photo</FieldLabel>
          <AvatarUploadField
            folder={`avatars/${userId}`}
            value={avatarUrl}
            onChange={setAvatarUrl}
            fallbackName={fullName}
          />
        </Field>

        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input id="firstName" name="firstName" defaultValue={defaultValues.firstName} required />
            <FieldError errors={state?.fieldErrors?.firstName?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input id="lastName" name="lastName" defaultValue={defaultValues.lastName} required />
            <FieldError errors={state?.fieldErrors?.lastName?.map((message) => ({ message }))} />
          </Field>
        </Field>
        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input id="phone" name="phone" defaultValue={defaultValues.phone ?? ""} />
        </Field>

        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </FieldGroup>
    </form>
  );
}
