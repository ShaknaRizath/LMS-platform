"use client";

import { useState, useTransition } from "react";
import { assignLecturer } from "@/lib/actions/admin/module.actions";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AssignLecturerForm({
  moduleId,
  lecturers,
}: {
  moduleId: string;
  lecturers: { id: string; firstName: string; lastName: string }[];
}) {
  const [selected, setSelected] = useState<string>("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <Select value={selected} onValueChange={(value) => setSelected(value ?? "")}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Select a lecturer" />
        </SelectTrigger>
        <SelectContent>
          {lecturers.map((lecturer) => (
            <SelectItem key={lecturer.id} value={lecturer.id}>
              {lecturer.firstName} {lecturer.lastName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        type="button"
        disabled={!selected || pending}
        onClick={() =>
          startTransition(async () => {
            await assignLecturer(moduleId, selected);
            setSelected("");
          })
        }
      >
        Assign
      </Button>
    </div>
  );
}
