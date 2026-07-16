"use client";

import { decideScholarship } from "@/lib/actions/finance/scholarship.actions";
import { SCHOLARSHIP_DISCOUNT_TYPE_OPTIONS } from "@/lib/validation/scholarship.schema";
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";

const DISCOUNT_TYPE_LABELS: Record<(typeof SCHOLARSHIP_DISCOUNT_TYPE_OPTIONS)[number], string> = {
  PERCENTAGE: "Percentage off",
  FIXED_AMOUNT: "Fixed amount off",
};

export function ScholarshipDecisionActions({ scholarshipId }: { scholarshipId: string }) {
  return (
    <form action={decideScholarship.bind(null, scholarshipId, "APPROVED")} className="flex flex-col gap-3">
      <FieldGroup>
        <Field orientation="responsive">
          <Field>
            <FieldLabel htmlFor={`discountType-${scholarshipId}`}>Discount type</FieldLabel>
            <Select
              name="discountType"
              defaultValue="PERCENTAGE"
              items={SCHOLARSHIP_DISCOUNT_TYPE_OPTIONS.map((type) => ({ value: type, label: DISCOUNT_TYPE_LABELS[type] }))}
            >
              <SelectTrigger id={`discountType-${scholarshipId}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SCHOLARSHIP_DISCOUNT_TYPE_OPTIONS.map((type) => (
                  <SelectItem key={type} value={type}>
                    {DISCOUNT_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`discountValue-${scholarshipId}`}>Discount value</FieldLabel>
            <Input id={`discountValue-${scholarshipId}`} name="discountValue" type="number" min="0" step="0.01" placeholder="e.g. 20" />
          </Field>
        </Field>
        <Textarea name="decisionNote" placeholder="Optional note" className="min-h-9" />
        <div className="flex gap-2">
          <Button type="submit" size="sm">
            Approve
          </Button>
          <Button
            type="submit"
            formAction={decideScholarship.bind(null, scholarshipId, "REJECTED")}
            variant="destructive"
            size="sm"
          >
            Reject
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
