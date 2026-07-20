"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "@/lib/actions/student/profile.actions";
import { useFileUpload } from "@/lib/storage/use-file-upload";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function toDateInputValue(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function ProfileForm({
  studentId,
  defaultValues,
}: {
  studentId: string;
  defaultValues: {
    firstName: string;
    lastName: string;
    phone: string | null;
    dateOfBirth: Date | null;
    address: string | null;
    guardianName: string | null;
    guardianPhone: string | null;
    avatarUrl: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateProfile,
    undefined
  );
  const [avatarUrl, setAvatarUrl] = useState(defaultValues.avatarUrl ?? "");
  const { upload, uploading, error: uploadError } = useFileUpload();
  const fullName = `${defaultValues.firstName} ${defaultValues.lastName}`;

  return (
    <form action={formAction}>
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
                const result = await upload(file, `avatars/${studentId}`);
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
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="phone">Phone</FieldLabel>
            <Input id="phone" name="phone" defaultValue={defaultValues.phone ?? ""} />
          </Field>
          <Field>
            <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={toDateInputValue(defaultValues.dateOfBirth)}
            />
            <FieldError errors={state?.fieldErrors?.dateOfBirth?.map((message) => ({ message }))} />
          </Field>
        </Field>
        <Field>
          <FieldLabel htmlFor="address">Address</FieldLabel>
          <Textarea id="address" name="address" defaultValue={defaultValues.address ?? ""} rows={3} />
        </Field>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="guardianName">Guardian / emergency contact name</FieldLabel>
            <Input id="guardianName" name="guardianName" defaultValue={defaultValues.guardianName ?? ""} />
          </Field>
          <Field>
            <FieldLabel htmlFor="guardianPhone">Guardian / emergency contact phone</FieldLabel>
            <Input id="guardianPhone" name="guardianPhone" defaultValue={defaultValues.guardianPhone ?? ""} />
          </Field>
        </Field>
        <FieldDescription>Used to reach someone on your behalf in an emergency.</FieldDescription>

        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending || uploading} className="self-start">
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </FieldGroup>
    </form>
  );
}
