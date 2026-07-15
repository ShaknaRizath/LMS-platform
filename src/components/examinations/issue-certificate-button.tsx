"use client";

import { useActionState } from "react";
import { Award } from "lucide-react";
import type { ActionState } from "@/lib/actions/action-state";
import { issueCertificate } from "@/lib/actions/examinations/certificate.actions";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

export function IssueCertificateButton({ studentId, moduleId }: { studentId: string; moduleId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    issueCertificate.bind(null, studentId, moduleId),
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Button type="submit" size="sm" disabled={pending}>
        <Award />
        {pending ? "Generating..." : "Issue certificate"}
      </Button>
      {state?.error && <FieldError>{state.error}</FieldError>}
    </form>
  );
}
