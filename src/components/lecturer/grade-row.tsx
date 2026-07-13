"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import type { ActionState } from "@/lib/actions/action-state";
import { gradeSubmission } from "@/lib/actions/lecturer/submission.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

export type SubmissionData = {
  id: string;
  textResponse: string | null;
  fileUrl: string | null;
  submittedAt: Date;
  grade: number | string | null;
  feedback: string | null;
  gradedAt: Date | null;
} | null;

export function GradeRow({
  studentName,
  submission,
  moduleId,
  contentItemId,
}: {
  studentName: string;
  submission: SubmissionData;
  moduleId: string;
  contentItemId: string;
}) {
  const [editing, setEditing] = useState(false);

  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    submission ? gradeSubmission.bind(null, submission.id, moduleId, contentItemId) : async () => undefined,
    undefined
  );

  if (!submission) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background p-3">
        <p className="text-sm font-medium">{studentName}</p>
        <p className="text-sm text-muted-foreground">Not submitted</p>
      </div>
    );
  }

  const showForm = editing || !submission.gradedAt;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">{studentName}</p>
          <p className="text-xs text-muted-foreground">
            Submitted {submission.submittedAt.toLocaleDateString()}
          </p>
        </div>
        {submission.gradedAt && !editing && (
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
            Edit grade
          </Button>
        )}
      </div>

      {submission.textResponse && (
        <p className="whitespace-pre-wrap text-sm text-muted-foreground">{submission.textResponse}</p>
      )}
      {submission.fileUrl && (
        <a
          href={submission.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit text-sm text-primary hover:underline"
        >
          View submitted file
        </a>
      )}

      {showForm ? (
        <form action={formAction} className="flex flex-col gap-2">
          <FieldGroup>
            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor={`grade-${submission.id}`}>Grade (0–100)</FieldLabel>
                <Input
                  id={`grade-${submission.id}`}
                  name="grade"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  defaultValue={submission.grade?.toString() ?? ""}
                  required
                />
                <FieldError errors={state?.fieldErrors?.grade?.map((message) => ({ message }))} />
              </Field>
              <Field>
                <FieldLabel htmlFor={`feedback-${submission.id}`}>Feedback (optional)</FieldLabel>
                <Textarea
                  id={`feedback-${submission.id}`}
                  name="feedback"
                  rows={1}
                  defaultValue={submission.feedback ?? ""}
                />
              </Field>
            </Field>
            {state?.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" size="sm" disabled={pending} className="w-fit">
              {pending ? "Saving..." : submission.gradedAt ? "Update grade" : "Save grade"}
            </Button>
          </FieldGroup>
        </form>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Grade: {submission.grade}</span>
          {submission.feedback && (
            <span className="text-sm text-muted-foreground">— {submission.feedback}</span>
          )}
        </div>
      )}
    </div>
  );
}
