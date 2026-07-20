"use client";

import { useActionState, useState } from "react";
import { updateOwnProfile } from "@/lib/actions/shared/profile.actions";
import { useFileUpload } from "@/lib/storage/use-file-upload";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
  const { upload, uploading, error: uploadError } = useFileUpload();
  const fullName = `${defaultValues.firstName} ${defaultValues.lastName}`;

  return (
    <form action={formAction} key={formKey}>
      <input type="hidden" name="avatarUrl" value={avatarUrl} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="avatar">Profile photo</FieldLabel>
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
              <AvatarFallback className="bg-secondary text-secondary-foreground">
                {initials(fullName)}
              </AvatarFallback>
            </Avatar>
            <Input
              id="avatar"
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const result = await upload(file, `avatars/${userId}`);
                if (result) setAvatarUrl(result.url);
              }}
            />
          </div>
          {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
          {uploadError && <FieldError>{uploadError}</FieldError>}
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
        <Button type="submit" disabled={pending || uploading} className="self-start">
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </FieldGroup>
    </form>
  );
}
