"use client";

import { useActionState, useState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import type { ContentType } from "@/generated/prisma/enums";
import { useFileUpload } from "@/lib/storage/use-file-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";

function toDateTimeLocalValue(date?: Date | null) {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const TYPE_LABELS: Record<ContentType, string> = {
  RICH_TEXT: "Text page",
  FILE: "File (PDF, slides, docs)",
  LINK: "External link",
  VIDEO: "Video link",
  ZOOM: "Zoom meeting",
  GOOGLE_MEET: "Google Meet",
};

export function ContentItemForm({
  action,
  defaultValues,
  submitLabel,
  onSuccess,
  categories = [],
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    type: ContentType;
    title: string;
    description: string | null;
    linkUrl?: string | null;
    videoUrl?: string | null;
    zoomJoinUrl?: string | null;
    zoomMeetingId?: string | null;
    zoomPasscode?: string | null;
    meetJoinUrl?: string | null;
    scheduledAt?: Date | null;
    richTextHtml?: string | null;
    fileUrl?: string | null;
    fileName?: string | null;
    isAssignment: boolean;
    dueDate: Date | null;
    assessmentCategoryId?: string | null;
  };
  submitLabel: string;
  onSuccess?: () => void;
  categories?: { id: string; name: string }[];
}) {
  const [type, setType] = useState<ContentType>(defaultValues?.type ?? "RICH_TEXT");
  const [uploadedFile, setUploadedFile] = useState<{ url: string; name: string } | null>(
    defaultValues?.fileUrl ? { url: defaultValues.fileUrl, name: defaultValues.fileName ?? "file" } : null
  );
  const { upload, uploading, error: uploadError } = useFileUpload();

  async function wrappedAction(prevState: ActionState, formData: FormData) {
    const result = await action(prevState, formData);
    if (!result?.error && !result?.fieldErrors) {
      onSuccess?.();
    }
    return result;
  }

  const [state, formAction, pending] = useActionState<ActionState, FormData>(wrappedAction, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="type">Content type</FieldLabel>
          <Select
            name="type"
            value={type}
            onValueChange={(value) => setType(value as ContentType)}
            items={(Object.keys(TYPE_LABELS) as ContentType[]).map((option) => ({
              value: option,
              label: TYPE_LABELS[option],
            }))}
          >
            <SelectTrigger id="type" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(TYPE_LABELS) as ContentType[]).map((option) => (
                <SelectItem key={option} value={option}>
                  {TYPE_LABELS[option]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input id="title" name="title" defaultValue={defaultValues?.title} required />
          <FieldError errors={state?.fieldErrors?.title?.map((message) => ({ message }))} />
        </Field>

        <Field>
          <FieldLabel htmlFor="description">Description (optional)</FieldLabel>
          <Textarea id="description" name="description" defaultValue={defaultValues?.description ?? ""} rows={2} />
        </Field>

        {type === "RICH_TEXT" && (
          <Field>
            <FieldLabel htmlFor="richTextHtml">Content</FieldLabel>
            <Textarea
              id="richTextHtml"
              name="richTextHtml"
              defaultValue={defaultValues?.richTextHtml ?? ""}
              rows={6}
              placeholder="Write the page content here. Basic HTML tags are supported."
            />
            <FieldError errors={state?.fieldErrors?.richTextHtml?.map((message) => ({ message }))} />
          </Field>
        )}

        {type === "LINK" && (
          <Field>
            <FieldLabel htmlFor="linkUrl">Link URL</FieldLabel>
            <Input
              id="linkUrl"
              name="linkUrl"
              type="url"
              placeholder="https://..."
              defaultValue={defaultValues?.linkUrl ?? ""}
            />
            <FieldError errors={state?.fieldErrors?.linkUrl?.map((message) => ({ message }))} />
          </Field>
        )}

        {type === "VIDEO" && (
          <Field>
            <FieldLabel htmlFor="videoUrl">Video URL</FieldLabel>
            <Input
              id="videoUrl"
              name="videoUrl"
              type="url"
              placeholder="https://..."
              defaultValue={defaultValues?.videoUrl ?? ""}
            />
            <FieldError errors={state?.fieldErrors?.videoUrl?.map((message) => ({ message }))} />
          </Field>
        )}

        {type === "ZOOM" && (
          <>
            <Field>
              <FieldLabel htmlFor="zoomJoinUrl">Zoom join URL</FieldLabel>
              <Input
                id="zoomJoinUrl"
                name="zoomJoinUrl"
                type="url"
                placeholder="https://zoom.us/j/..."
                defaultValue={defaultValues?.zoomJoinUrl ?? ""}
              />
              <FieldError errors={state?.fieldErrors?.zoomJoinUrl?.map((message) => ({ message }))} />
            </Field>
            <Field orientation="responsive">
              <Field>
                <FieldLabel htmlFor="zoomMeetingId">Meeting ID (optional)</FieldLabel>
                <Input id="zoomMeetingId" name="zoomMeetingId" defaultValue={defaultValues?.zoomMeetingId ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="zoomPasscode">Passcode (optional)</FieldLabel>
                <Input id="zoomPasscode" name="zoomPasscode" defaultValue={defaultValues?.zoomPasscode ?? ""} />
              </Field>
            </Field>
            <Field>
              <FieldLabel htmlFor="scheduledAt">Session starts</FieldLabel>
              <Input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                defaultValue={toDateTimeLocalValue(defaultValues?.scheduledAt)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Students can join from 15 minutes before this time.
              </p>
              <FieldError errors={state?.fieldErrors?.scheduledAt?.map((message) => ({ message }))} />
            </Field>
          </>
        )}

        {type === "GOOGLE_MEET" && (
          <>
            <Field>
              <FieldLabel htmlFor="meetJoinUrl">Google Meet join URL</FieldLabel>
              <Input
                id="meetJoinUrl"
                name="meetJoinUrl"
                type="url"
                placeholder="https://meet.google.com/..."
                defaultValue={defaultValues?.meetJoinUrl ?? ""}
              />
              <FieldError errors={state?.fieldErrors?.meetJoinUrl?.map((message) => ({ message }))} />
            </Field>
            <Field>
              <FieldLabel htmlFor="scheduledAt">Session starts</FieldLabel>
              <Input
                id="scheduledAt"
                name="scheduledAt"
                type="datetime-local"
                defaultValue={toDateTimeLocalValue(defaultValues?.scheduledAt)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Students can join from 15 minutes before this time.
              </p>
              <FieldError errors={state?.fieldErrors?.scheduledAt?.map((message) => ({ message }))} />
            </Field>
          </>
        )}

        {type === "FILE" && (
          <Field>
            <FieldLabel htmlFor="file">File</FieldLabel>
            <input type="hidden" name="fileUrl" value={uploadedFile?.url ?? ""} />
            <input type="hidden" name="fileName" value={uploadedFile?.name ?? ""} />
            <Input
              id="file"
              type="file"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const result = await upload(file, "content-files");
                if (result) setUploadedFile({ url: result.url, name: result.fileName });
              }}
            />
            {uploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
            {uploadedFile && !uploading && (
              <p className="text-sm text-muted-foreground">Uploaded: {uploadedFile.name}</p>
            )}
            {uploadError && <FieldError>{uploadError}</FieldError>}
            <FieldError errors={state?.fieldErrors?.fileUrl?.map((message) => ({ message }))} />
          </Field>
        )}

        <Field orientation="horizontal">
          <Checkbox
            id="isAssignment"
            name="isAssignment"
            value="true"
            defaultChecked={defaultValues?.isAssignment}
          />
          <FieldLabel htmlFor="isAssignment" className="font-normal">
            This is an assignment (has a due date)
          </FieldLabel>
        </Field>

        <Field>
          <FieldLabel htmlFor="dueDate">Due date (optional)</FieldLabel>
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            defaultValue={defaultValues?.dueDate ? defaultValues.dueDate.toISOString().slice(0, 10) : ""}
          />
        </Field>

        {categories.length > 0 && (
          <Field>
            <FieldLabel htmlFor="assessmentCategoryId">Assessment category (optional)</FieldLabel>
            <Select
              name="assessmentCategoryId"
              defaultValue={defaultValues?.assessmentCategoryId ?? "NONE"}
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
            <p className="text-xs text-muted-foreground">
              Counts toward the Grade Book if this is graded. Leave as None to exclude it.
            </p>
          </Field>
        )}

        {state?.error && <FieldError>{state.error}</FieldError>}
        <Button type="submit" disabled={pending || uploading}>
          {pending ? "Saving..." : submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
