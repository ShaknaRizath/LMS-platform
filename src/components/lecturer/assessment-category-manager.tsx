"use client";

import { useState } from "react";
import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import {
  createAssessmentCategory,
  updateAssessmentCategory,
  deleteAssessmentCategory,
} from "@/lib/actions/lecturer/assessment-category.actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

function CategoryRow({
  moduleId,
  category,
}: {
  moduleId: string;
  category: { id: string; name: string; weightPercent: number };
}) {
  const [editing, setEditing] = useState(false);

  async function wrappedAction(prevState: ActionState, formData: FormData) {
    const result = await updateAssessmentCategory(category.id, moduleId, prevState, formData);
    if (!result?.error && !result?.fieldErrors) setEditing(false);
    return result;
  }

  const [state, formAction, pending] = useActionState<ActionState, FormData>(wrappedAction, undefined);

  if (!editing) {
    return (
      <li className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
        <span className="text-sm">
          {category.name} · {category.weightPercent}%
        </span>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
          <form action={deleteAssessmentCategory.bind(null, category.id, moduleId)}>
            <Button type="submit" variant="ghost" size="sm">
              Remove
            </Button>
          </form>
        </div>
      </li>
    );
  }

  return (
    <li className="rounded-lg border border-border p-3">
      <form action={formAction} className="flex flex-col gap-3">
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor={`name-${category.id}`}>Category name</FieldLabel>
            <Input id={`name-${category.id}`} name="name" defaultValue={category.name} required />
            <FieldError errors={state?.fieldErrors?.name?.map((message) => ({ message }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor={`weight-${category.id}`}>Weight %</FieldLabel>
            <Input
              id={`weight-${category.id}`}
              name="weightPercent"
              type="number"
              min={1}
              max={100}
              defaultValue={category.weightPercent}
              required
            />
            <FieldError errors={state?.fieldErrors?.weightPercent?.map((message) => ({ message }))} />
          </Field>
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <div className="flex items-center gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </li>
  );
}

export function AssessmentCategoryManager({
  moduleId,
  categories,
}: {
  moduleId: string;
  categories: { id: string; name: string; weightPercent: number }[];
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createAssessmentCategory.bind(null, moduleId),
    undefined
  );

  const totalWeight = categories.reduce((sum, c) => sum + c.weightPercent, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assessment categories</CardTitle>
        <CardDescription>
          {totalWeight}% of 100% allocated
          {totalWeight !== 100 && " — the module grade stays \"in progress\" until this reaches 100%"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {categories.length > 0 && (
          <ul className="flex flex-col gap-2">
            {categories.map((category) => (
              <CategoryRow key={category.id} moduleId={moduleId} category={category} />
            ))}
          </ul>
        )}

        <form action={formAction} className="flex flex-col gap-4 rounded-xl border border-dashed border-border p-4">
          <FieldGroup>
            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor="name">Category name</FieldLabel>
                <Input id="name" name="name" placeholder="e.g. Assignments" required />
                <FieldError errors={state?.fieldErrors?.name?.map((message) => ({ message }))} />
              </Field>
              <Field>
                <FieldLabel htmlFor="weightPercent">Weight %</FieldLabel>
                <Input id="weightPercent" name="weightPercent" type="number" min={1} max={100} required />
                <FieldError errors={state?.fieldErrors?.weightPercent?.map((message) => ({ message }))} />
              </Field>
            </Field>
            {state?.error && <FieldError>{state.error}</FieldError>}
            <Button type="submit" disabled={pending} className="self-start">
              {pending ? "Adding..." : "Add category"}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
