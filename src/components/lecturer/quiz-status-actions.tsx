"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { publishQuiz, submitExamForScheduling, closeQuiz } from "@/lib/actions/lecturer/quiz.actions";

export function QuizStatusActions({
  quizId,
  kind,
  status,
  canPublish,
}: {
  quizId: string;
  kind: "QUIZ" | "EXAM" | "PRACTICAL";
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CLOSED";
  canPublish: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (status === "DRAFT" && kind !== "EXAM") {
    return (
      <Button
        type="button"
        disabled={pending || !canPublish}
        onClick={() => startTransition(() => publishQuiz(quizId))}
      >
        {pending ? "Publishing..." : kind === "PRACTICAL" ? "Publish practical assessment" : "Publish quiz"}
      </Button>
    );
  }

  if (status === "DRAFT" && kind === "EXAM") {
    return (
      <Button
        type="button"
        disabled={pending || !canPublish}
        onClick={() => startTransition(() => submitExamForScheduling(quizId))}
      >
        {pending ? "Submitting..." : "Submit for scheduling"}
      </Button>
    );
  }

  if (status === "PUBLISHED" || status === "SCHEDULED") {
    return (
      <Button type="button" variant="outline" disabled={pending} onClick={() => startTransition(() => closeQuiz(quizId))}>
        {pending ? "Closing..." : "Close"}
      </Button>
    );
  }

  return null;
}
