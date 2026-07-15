"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import type { ActionState } from "@/lib/actions/action-state";
import { updateQuiz } from "@/lib/actions/lecturer/quiz.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function QuizMetaEditor({
  quizId,
  defaultValues,
  categories = [],
}: {
  quizId: string;
  defaultValues: {
    title: string;
    description: string | null;
    timeLimitMinutes: number | null;
    maxAttempts: number;
    assessmentCategoryId: string | null;
  };
  categories?: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  async function wrappedAction(prevState: ActionState, formData: FormData) {
    const result = await updateQuiz(quizId, prevState, formData);
    if (!result?.error && !result?.fieldErrors) setOpen(false);
    return result;
  }
  const [state, formAction, pending] = useActionState<ActionState, FormData>(wrappedAction, undefined);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="ghost" size="icon-sm">
            <Pencil />
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit quiz details</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="title">Title</FieldLabel>
              <Input id="title" name="title" defaultValue={defaultValues.title} required />
              <FieldError errors={state?.fieldErrors?.title?.map((message) => ({ message }))} />
            </Field>
            <Field>
              <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
              <Textarea id="description" name="description" defaultValue={defaultValues.description ?? ""} rows={2} />
            </Field>
            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor="timeLimitMinutes">Time limit, minutes (optional)</FieldLabel>
                <Input
                  id="timeLimitMinutes"
                  name="timeLimitMinutes"
                  type="number"
                  min={1}
                  defaultValue={defaultValues.timeLimitMinutes ?? ""}
                />
                <FieldError errors={state?.fieldErrors?.timeLimitMinutes?.map((message) => ({ message }))} />
              </Field>
              <Field>
                <FieldLabel htmlFor="maxAttempts">Max attempts</FieldLabel>
                <Input
                  id="maxAttempts"
                  name="maxAttempts"
                  type="number"
                  min={1}
                  defaultValue={defaultValues.maxAttempts}
                  required
                />
                <FieldError errors={state?.fieldErrors?.maxAttempts?.map((message) => ({ message }))} />
              </Field>
            </Field>
            {categories.length > 0 && (
              <Field>
                <FieldLabel htmlFor="assessmentCategoryId">Assessment category (optional)</FieldLabel>
                <Select
                  name="assessmentCategoryId"
                  defaultValue={defaultValues.assessmentCategoryId ?? "NONE"}
                  items={[{ value: "NONE", label: "None" }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
                >
                  <SelectTrigger id="assessmentCategoryId" className="w-full">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
            {state?.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save changes"}
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
