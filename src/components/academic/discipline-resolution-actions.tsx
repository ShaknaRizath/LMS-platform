"use client";

import { resolveDisciplineCase } from "@/lib/actions/academic/discipline.actions";
import { DISCIPLINE_OUTCOME_OPTIONS } from "@/lib/validation/discipline-case.schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

const OUTCOME_LABELS: Record<(typeof DISCIPLINE_OUTCOME_OPTIONS)[number], string> = {
  NONE: "No action",
  WARNING: "Warning",
  SUSPENSION: "Suspension",
  EXPULSION: "Expulsion",
};

export function DisciplineResolutionActions({ caseId }: { caseId: string }) {
  return (
    <form action={resolveDisciplineCase.bind(null, caseId)} className="flex flex-col gap-3">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`outcome-${caseId}`}>Outcome</FieldLabel>
          <Select
            name="outcome"
            defaultValue="WARNING"
            items={DISCIPLINE_OUTCOME_OPTIONS.map((outcome) => ({ value: outcome, label: OUTCOME_LABELS[outcome] }))}
          >
            <SelectTrigger id={`outcome-${caseId}`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISCIPLINE_OUTCOME_OPTIONS.map((outcome) => (
                <SelectItem key={outcome} value={outcome}>
                  {OUTCOME_LABELS[outcome]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Textarea name="resolutionNote" placeholder="Optional resolution note" className="min-h-9" />
        <Button type="submit" size="sm" className="self-start">
          Resolve case
        </Button>
      </FieldGroup>
    </form>
  );
}
