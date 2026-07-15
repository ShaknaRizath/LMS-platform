"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/actions/action-state";
import { ATTENDANCE_STATUSES } from "@/lib/validation/attendance.schema";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";

const STATUS_LABELS: Record<(typeof ATTENDANCE_STATUSES)[number], string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
};

export function AttendanceRosterForm({
  students,
  existingStatuses,
  action,
}: {
  students: { id: string; firstName: string; lastName: string }[];
  existingStatuses: Record<string, string>;
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  if (students.length === 0) {
    return <p className="text-sm text-muted-foreground">No active students enrolled in this module yet.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {students.map((student) => {
          const fieldName = `status_${student.id}`;
          const current = existingStatuses[student.id] ?? "PRESENT";
          return (
            <div
              key={student.id}
              className="flex flex-col gap-2 rounded-lg border border-border px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium text-foreground">
                {student.firstName} {student.lastName}
              </span>
              <div className="flex items-center gap-4">
                {ATTENDANCE_STATUSES.map((status) => (
                  <label key={status} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <input
                      type="radio"
                      name={fieldName}
                      value={status}
                      defaultChecked={current === status}
                    />
                    {STATUS_LABELS[status]}
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {state?.error && <FieldError>{state.error}</FieldError>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Saving..." : "Save attendance"}
      </Button>
    </form>
  );
}
