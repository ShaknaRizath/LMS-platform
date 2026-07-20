"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "@/lib/actions/student/profile.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { AvatarUploadField } from "@/components/shared/avatar-upload-field";

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
  const fullName = `${defaultValues.firstName} ${defaultValues.lastName}`;

  return (
    <form action={formAction}>
      <input type="hidden" name="avatarUrl" value={avatarUrl} />
      <FieldGroup>
        <Field>
          <FieldLabel>Profile photo</FieldLabel>
          <AvatarUploadField
            folder={`avatars/${studentId}`}
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
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Saving..." : "Save changes"}
        </Button>
      </FieldGroup>
    </form>
  );
}
