"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import type { ActionState } from "@/lib/actions/action-state";
import { ROLE_OPTIONS } from "@/lib/validation/user.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";

// Excludes visually-ambiguous characters (0/O, 1/l/I) so a generated password can be read
// aloud or copied to a lecturer/student without confusion.
function generatePassword(length = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

const ROLE_LABELS: Record<(typeof ROLE_OPTIONS)[number], string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrator",
  LECTURER: "Lecturer",
  FINANCE: "Finance Staff",
  REGISTRAR: "Registrar",
  STUDENT: "Student",
};

export function UserForm({
  action,
  mode,
  programs,
  defaultValues,
  submitLabel,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  mode: "create" | "edit";
  programs: { id: string; name: string }[];
  defaultValues?: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    role: string;
    programId: string | null;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction}>
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="firstName">First name</FieldLabel>
            <Input id="firstName" name="firstName" defaultValue={defaultValues?.firstName} required />
            <FieldError errors={state?.fieldErrors?.firstName?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">Last name</FieldLabel>
            <Input id="lastName" name="lastName" defaultValue={defaultValues?.lastName} required />
            <FieldError errors={state?.fieldErrors?.lastName?.map((message) => ({ message }))} />
          </Field>
        </Field>

        {mode === "create" ? (
          <>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input id="email" name="email" type="email" placeholder="name@cims.edu" required />
              <FieldError errors={state?.fieldErrors?.email?.map((message) => ({ message }))} />
            </Field>

            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="flex gap-2">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Leave blank to email a set-password link"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPassword(generatePassword());
                    setShowPassword(true);
                  }}
                >
                  <RefreshCw className="size-4" />
                  Generate
                </Button>
              </div>
              <FieldDescription>
                Leave blank to email the user a link to set their own password. Set one here to
                give the account to them directly (useful when email delivery isn&apos;t configured) —
                copy it before submitting, it won&apos;t be shown again.
              </FieldDescription>
              <FieldError errors={state?.fieldErrors?.password?.map((message) => ({ message }))} />
            </Field>
          </>
        ) : (
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" value={defaultValues?.email} disabled />
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input id="phone" name="phone" defaultValue={defaultValues?.phone ?? ""} />
        </Field>

        <Field>
          <FieldLabel htmlFor="role">Role</FieldLabel>
          <Select
            name="role"
            defaultValue={defaultValues?.role}
            items={ROLE_OPTIONS.map((role) => ({ value: role, label: ROLE_LABELS[role] }))}
          >
            <SelectTrigger id="role" className="w-full">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((role) => (
                <SelectItem key={role} value={role}>
                  {ROLE_LABELS[role]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError errors={state?.fieldErrors?.role?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="programId">Program (students only)</FieldLabel>
          <Select
            name="programId"
            defaultValue={defaultValues?.programId ?? undefined}
            items={programs.map((program) => ({ value: program.id, label: program.name }))}
          >
            <SelectTrigger id="programId" className="w-full">
              <SelectValue placeholder="No program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
