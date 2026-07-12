"use client";

import { useActionState } from "react";
import { setProgramCurriculumFee } from "@/lib/actions/admin/program.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldError } from "@/components/ui/field";

export function ProgramCurriculumFeeForm({
  programId,
  yearLevel,
  semesterNumber,
  currentAmount,
}: {
  programId: string;
  yearLevel: number;
  semesterNumber: number;
  currentAmount: string | null;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    setProgramCurriculumFee.bind(null, programId, yearLevel, semesterNumber),
    undefined
  );

  return (
    <form action={formAction} className="flex items-start gap-2">
      <Field>
        <Input
          key={currentAmount ?? "unset"}
          name="amount"
          type="number"
          min={0.01}
          step="0.01"
          placeholder="Not set"
          defaultValue={currentAmount ?? ""}
          className="w-36"
        />
        <FieldError errors={state?.fieldErrors?.amount?.map((message) => ({ message }))} />
      </Field>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </Button>
    </form>
  );
}
