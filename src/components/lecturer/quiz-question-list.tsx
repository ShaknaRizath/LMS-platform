"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { QuizQuestionForm } from "@/components/lecturer/quiz-question-form";
import { deleteQuestion, updateQuestion } from "@/lib/actions/lecturer/quiz.actions";

export type QuizQuestionData = {
  id: string;
  type: "MCQ" | "TRUE_FALSE" | "ESSAY";
  prompt: string;
  points: number;
  options: { id: string; text: string; isCorrect: boolean }[];
  promptFileUrl: string | null;
  promptFileName: string | null;
  answerFormat: "TEXT" | "FILE";
};

function questionTypeLabel(question: Pick<QuizQuestionData, "type" | "answerFormat">) {
  if (question.type === "MCQ") return "Multiple choice";
  if (question.type === "TRUE_FALSE") return "True / False";
  return question.answerFormat === "FILE" ? "Essay — file upload, manually graded" : "Essay — manually graded";
}

function PromptAttachment({ question }: { question: Pick<QuizQuestionData, "promptFileUrl" | "promptFileName"> }) {
  if (!question.promptFileUrl) return null;
  return (
    <a
      href={question.promptFileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 flex w-fit items-center gap-1.5 text-xs text-primary hover:underline"
    >
      <Download className="size-3.5" />
      {question.promptFileName ?? "Attached file"}
    </a>
  );
}

function QuizQuestionRow({
  question,
  quizId,
}: {
  question: QuizQuestionData;
  quizId: string;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium">{question.prompt}</p>
          <PromptAttachment question={question} />
          <p className="text-xs text-muted-foreground">
            {questionTypeLabel(question)} · {question.points} pt{question.points === 1 ? "" : "s"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger
              render={
                <Button type="button" variant="ghost" size="icon-sm">
                  <Pencil />
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit question</DialogTitle>
              </DialogHeader>
              <QuizQuestionForm
                action={updateQuestion.bind(null, question.id, quizId)}
                submitLabel="Save changes"
                pendingLabel="Saving..."
                onSuccess={() => setEditOpen(false)}
                defaultValues={{
                  type: question.type,
                  prompt: question.prompt,
                  points: question.points,
                  options: question.options.map((option) => option.text),
                  correctIndex:
                    question.type === "MCQ"
                      ? question.options.findIndex((option) => option.isCorrect)
                      : null,
                  correctAnswer:
                    question.type === "TRUE_FALSE"
                      ? question.options.find((option) => option.isCorrect)?.text === "True"
                        ? "true"
                        : "false"
                      : null,
                  promptFileUrl: question.promptFileUrl,
                  promptFileName: question.promptFileName,
                  answerFormat: question.answerFormat,
                }}
              />
            </DialogContent>
          </Dialog>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={pending}
            onClick={() => startTransition(() => deleteQuestion(question.id, quizId))}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      {question.type === "ESSAY" ? (
        <p className="mt-2 text-sm text-muted-foreground">
          {question.answerFormat === "FILE"
            ? "Students upload a file as their answer — you'll award points after they submit."
            : "Students type a free-text answer — you'll award points after they submit."}
        </p>
      ) : (
        <ul className="mt-2 flex flex-col gap-1">
          {question.options.map((option) => (
            <li key={option.id} className="flex items-center gap-2 text-sm">
              {option.isCorrect ? <Badge>Correct</Badge> : <Badge variant="outline">Option</Badge>}
              {option.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function QuizQuestionList({
  questions,
  quizId,
  canEdit,
}: {
  questions: QuizQuestionData[];
  quizId: string;
  canEdit: boolean;
}) {
  if (questions.length === 0) {
    return <p className="text-sm text-muted-foreground">No questions yet.</p>;
  }

  if (!canEdit) {
    return (
      <div className="flex flex-col gap-3">
        {questions.map((question) => (
          <div key={question.id} className="rounded-lg border border-border bg-background p-3">
            <p className="text-sm font-medium">{question.prompt}</p>
            <PromptAttachment question={question} />
            <p className="text-xs text-muted-foreground">
              {questionTypeLabel(question)} · {question.points} pt{question.points === 1 ? "" : "s"}
            </p>
            {question.type !== "ESSAY" && (
              <ul className="mt-2 flex flex-col gap-1">
                {question.options.map((option) => (
                  <li key={option.id} className="flex items-center gap-2 text-sm">
                    {option.isCorrect ? <Badge>Correct</Badge> : <Badge variant="outline">Option</Badge>}
                    {option.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {questions.map((question) => (
        <QuizQuestionRow key={question.id} question={question} quizId={quizId} />
      ))}
    </div>
  );
}
