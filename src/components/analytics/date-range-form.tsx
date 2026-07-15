import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

export function DateRangeForm({ from, to }: { from: Date; to: Date }) {
  return (
    <form method="GET" className="flex flex-wrap items-end gap-3">
      <Field>
        <FieldLabel htmlFor="from">From</FieldLabel>
        <Input id="from" name="from" type="date" defaultValue={from.toISOString().slice(0, 10)} />
      </Field>
      <Field>
        <FieldLabel htmlFor="to">To</FieldLabel>
        <Input id="to" name="to" type="date" defaultValue={to.toISOString().slice(0, 10)} />
      </Field>
      <Button type="submit" variant="outline">
        Apply
      </Button>
    </form>
  );
}
