"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FieldError } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ResultRow = {
  studentId: string;
  name: string;
  attemptsUsed: number;
  best: { attemptId: string; pointsEarned: number; totalPoints: number; published: boolean } | null;
  pendingEssayCount: number;
};

export function PublishSelectedResultsForm({
  maxAttempts,
  rows,
  action,
}: {
  maxAttempts: number;
  rows: ResultRow[];
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  const eligibleCount = rows.filter(
    (row) => row.best && !row.best.published && row.pendingEssayCount === 0
  ).length;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Student</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const eligible = row.best !== null && !row.best.published && row.pendingEssayCount === 0;
              return (
                <TableRow key={row.studentId}>
                  <TableCell>
                    {eligible && <Checkbox name="attemptIds" value={row.best!.attemptId} />}
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>
                    {row.attemptsUsed} / {maxAttempts}
                  </TableCell>
                  <TableCell>
                    {row.best
                      ? `${row.best.pointsEarned} / ${row.best.totalPoints} (${Math.round(
                          (row.best.pointsEarned / row.best.totalPoints) * 100
                        )}%)`
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {!row.best ? (
                      <span className="text-sm text-muted-foreground">Not attempted</span>
                    ) : row.best.published ? (
                      <Badge variant="secondary">Already published</Badge>
                    ) : row.pendingEssayCount > 0 ? (
                      <span className="text-sm text-muted-foreground">
                        {row.pendingEssayCount} essay answer{row.pendingEssayCount === 1 ? "" : "s"} pending
                        grading
                      </span>
                    ) : (
                      <Badge variant="outline">Ready to publish</Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {state?.error && <FieldError>{state.error}</FieldError>}

      <Button type="submit" disabled={pending || eligibleCount === 0} className="self-start">
        {pending ? "Publishing..." : "Publish selected results"}
      </Button>
    </form>
  );
}
