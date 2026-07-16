"use client";

import { useTransition } from "react";
import { issueTranscript } from "@/lib/actions/examinations/transcript.actions";
import { Button } from "@/components/ui/button";

export function IssueTranscriptButton({ studentId }: { studentId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => issueTranscript(studentId))}
    >
      {pending ? "Generating..." : "Issue transcript"}
    </Button>
  );
}
