"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { publishAttemptResults } from "@/lib/actions/lecturer/quiz.actions";

export function PublishResultsButton({ attemptId, quizId }: { attemptId: string; quizId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => publishAttemptResults(attemptId, quizId))}
    >
      {pending ? "Publishing..." : "Publish results to student"}
    </Button>
  );
}
