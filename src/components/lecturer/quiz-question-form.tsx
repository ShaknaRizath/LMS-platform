"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

const TYPE_OPTIONS = [
  { value: "MCQ", label: "Multiple choice" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "ESSAY", label: "Essay (free text, graded manually)" },
];

const MAX_OPTIONS = 6;

export type QuizQuestionFormDefaultValues = {
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  prompt: string;
  points: number;
  options: string[];
  correctIndex: number | null;
  correctAnswer: "true" | "false" | null;
};

export function QuizQuestionForm({
  action,
  defaultValues,
  submitLabel = "Add question",
  pendingLabel = "Adding...",
  onSuccess,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: QuizQuestionFormDefaultValues;
  submitLabel?: string;
  pendingLabel?: string;
  onSuccess?: () => void;
}) {
  const [type, setType] = useState<string>(defaultValues?.type ?? "MCQ");
  const [options, setOptions] = useState<string[]>(
    defaultValues && defaultValues.options.length >= 2 ? defaultValues.options : ["", ""]
  );
  const [correctSlot, setCorrectSlot] = useState<number | null>(defaultValues?.correctIndex ?? null);

  async function wrappedAction(prevState: ActionState, formData: FormData) {
    const result = await action(prevState, formData);
    if (!result?.error && !result?.fieldErrors) {
      if (!defaultValues) {
        setOptions(["", ""]);
        setCorrectSlot(null);
      }
      onSuccess?.();
    }
    return result;
  }

  const [state, formAction, pending] = useActionState<ActionState, FormData>(wrappedAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4">
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor="type">Question type</FieldLabel>
            <Select name="type" value={type} onValueChange={(value) => setType(value ?? "MCQ")} items={TYPE_OPTIONS}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="points">Points</FieldLabel>
            <Input id="points" name="points" type="number" min={1} defaultValue={defaultValues?.points ?? 1} required />
            <FieldError errors={state?.fieldErrors?.points?.map((message) => ({ message }))} />
          </Field>
        </Field>

        <Field>
          <FieldLabel htmlFor="prompt">Question</FieldLabel>
          <Textarea id="prompt" name="prompt" rows={2} defaultValue={defaultValues?.prompt} required />
          <FieldError errors={state?.fieldErrors?.prompt?.map((message) => ({ message }))} />
        </Field>

        {type === "MCQ" && (
          <Field>
            <FieldLabel>Options — select the correct one</FieldLabel>
            <div className="flex flex-col gap-2">
              {options.map((value, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctIndex"
                    value={index}
                    checked={correctSlot === index}
                    onChange={() => setCorrectSlot(index)}
                    className="size-4 accent-primary"
                    aria-label={`Option ${index + 1} is correct`}
                  />
                  <Input
                    name={`optionText_${index}`}
                    value={value}
                    onChange={(event) => {
                      const next = [...options];
                      next[index] = event.target.value;
                      setOptions(next);
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        setOptions(options.filter((_, i) => i !== index));
                        setCorrectSlot((prev) =>
                          prev === null ? null : prev === index ? null : prev > index ? prev - 1 : prev
                        );
                      }}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {options.length < MAX_OPTIONS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="self-start"
                onClick={() => setOptions([...options, ""])}
              >
                <Plus /> Add option
              </Button>
            )}
            <FieldError errors={state?.fieldErrors?.options?.map((message) => ({ message }))} />
            <FieldError errors={state?.fieldErrors?.correctIndex?.map((message) => ({ message }))} />
          </Field>
        )}

        {type === "TRUE_FALSE" && (
          <Field>
            <FieldLabel>Correct answer</FieldLabel>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="correctAnswer"
                  value="true"
                  defaultChecked={defaultValues?.correctAnswer === "true"}
                  className="size-4 accent-primary"
                  required
                />
                True
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="correctAnswer"
                  value="false"
                  defaultChecked={defaultValues?.correctAnswer === "false"}
                  className="size-4 accent-primary"
                />
                False
              </label>
            </div>
            <FieldError errors={state?.fieldErrors?.correctAnswer?.map((message) => ({ message }))} />
          </Field>
        )}

        {type === "ESSAY" && (
          <p className="text-sm text-muted-foreground">
            Students will type a free-text answer. You&apos;ll award points manually after they submit.
          </p>
        )}

        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? pendingLabel : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
