"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { publishQuiz, submitExamForScheduling, closeQuiz } from "@/lib/actions/lecturer/quiz.actions";

export function QuizStatusActions({
  quizId,
  kind,
  status,
  hasQuestions,
}: {
  quizId: string;
  kind: "QUIZ" | "EXAM";
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "CLOSED";
  hasQuestions: boolean;
}) {
  const [pending, startTransition] = useTransition();

  if (status === "DRAFT" && kind === "QUIZ") {
    return (
      <Button
        type="button"
        disabled={pending || !hasQuestions}
        onClick={() => startTransition(() => publishQuiz(quizId))}
      >
        {pending ? "Publishing..." : "Publish quiz"}
      </Button>
    );
  }

  if (status === "DRAFT" && kind === "EXAM") {
    return (
      <Button
        type="button"
        disabled={pending || !hasQuestions}
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
