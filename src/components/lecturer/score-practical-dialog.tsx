"use client";

import { useActionState, useState } from "react";
import { scorePracticalAttempt } from "@/lib/actions/lecturer/rubric.actions";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ScorePracticalDialog({
  quizId,
  studentId,
  studentName,
  criteria,
  existingScores,
  triggerLabel,
}: {
  quizId: string;
  studentId: string;
  studentName: string;
  criteria: { id: string; name: string; maxPoints: number }[];
  existingScores: Record<string, number>;
  triggerLabel: string;
}) {
  const [open, setOpen] = useState(false);

  async function wrappedAction(prevState: ActionState, formData: FormData) {
    const result = await scorePracticalAttempt(quizId, studentId, prevState, formData);
    if (!result?.error && !result?.fieldErrors) setOpen(false);
    return result;
  }
  const [state, formAction, pending] = useActionState<ActionState, FormData>(wrappedAction, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm">{triggerLabel}</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Score {studentName}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <FieldGroup>
            {criteria.map((criterion) => (
              <Field key={criterion.id}>
                <FieldLabel htmlFor={`score_${criterion.id}`}>
                  {criterion.name} (0-{criterion.maxPoints})
                </FieldLabel>
                <Input
                  id={`score_${criterion.id}`}
                  name={`score_${criterion.id}`}
                  type="number"
                  min={0}
                  max={criterion.maxPoints}
                  defaultValue={existingScores[criterion.id] ?? 0}
                  required
                />
              </Field>
            ))}
            {state?.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save score"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
