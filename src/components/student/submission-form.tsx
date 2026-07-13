"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { useFileUpload } from "@/lib/storage/use-file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";

export function SubmissionForm({
  action,
  studentId,
  defaultTextResponse,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  studentId: string;
  defaultTextResponse?: string | null;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);
  const [file, setFile] = useState<{ url: string; name: string } | null>(null);
  const { upload, uploading, error: uploadError } = useFileUpload();

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="fileUrl" value={file?.url ?? ""} />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="textResponse">Written response (optional)</FieldLabel>
          <Textarea
            id="textResponse"
            name="textResponse"
            rows={5}
            defaultValue={defaultTextResponse ?? ""}
            placeholder="Type your answer here..."
          />
          <FieldError errors={state?.fieldErrors?.textResponse?.map((message) => ({ message }))} />
        </Field>
        <Field>
          <FieldLabel htmlFor="file">Attach a file (optional)</FieldLabel>
          <Input
            id="file"
            type="file"
            disabled={uploading}
            onChange={async (e) => {
              const selected = e.target.files?.[0];
              if (!selected) return;
              const result = await upload(selected, `submissions/${studentId}`);
              if (result) setFile({ url: result.url, name: result.fileName });
            }}
          />
          <FieldDescription>Upload a document, image, or PDF supporting your submission.</FieldDescription>
          {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
          {file && !uploading && <p className="text-sm text-muted-foreground">Uploaded: {file.name}</p>}
          {uploadError && <FieldError>{uploadError}</FieldError>}
        </Field>
        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending || uploading} className="w-fit">
          {pending ? "Submitting..." : "Submit assignment"}
        </Button>
      </FieldGroup>
    </form>
  );
}
