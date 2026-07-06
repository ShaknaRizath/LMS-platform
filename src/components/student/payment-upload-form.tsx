"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { useFileUpload } from "@/lib/storage/use-file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";

export function PaymentUploadForm({
  action,
  studentId,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  studentId: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);
  const [receipt, setReceipt] = useState<{ url: string; name: string } | null>(null);
  const { upload, uploading, error: uploadError } = useFileUpload();

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="receiptUrl" value={receipt?.url ?? ""} />
      <input type="hidden" name="receiptFileName" value={receipt?.name ?? ""} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="amount">Amount paid</FieldLabel>
          <Input id="amount" name="amount" type="number" min={0.01} step="0.01" required />
          <FieldError errors={state?.fieldErrors?.amount?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="receipt">Payment receipt</FieldLabel>
          <Input
            id="receipt"
            type="file"
            accept="image/*,.pdf"
            disabled={uploading}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const result = await upload(file, `receipts/${studentId}`);
              if (result) setReceipt({ url: result.url, name: result.fileName });
            }}
          />
          <FieldDescription>Upload a photo or PDF of your bank transfer or payment receipt.</FieldDescription>
          {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
          {receipt && !uploading && <p className="text-sm text-muted-foreground">Uploaded: {receipt.name}</p>}
          {uploadError && <FieldError>{uploadError}</FieldError>}
          <FieldError errors={state?.fieldErrors?.receiptUrl?.map((message) => ({ message }))} />
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending || uploading || !receipt}>
          {pending ? "Submitting..." : "Submit payment"}
        </Button>
      </FieldGroup>
    </form>
  );
}
