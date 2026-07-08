"use client";

import { useTransition } from "react";
import { setSemesterStatus } from "@/lib/actions/admin/academic-year.actions";
import type { SemesterStatus } from "@/generated/prisma/enums";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_OPTIONS: SemesterStatus[] = ["UPCOMING", "ACTIVE", "CLOSED"];

export function SemesterStatusSelect({
  semesterId,
  academicYearId,
  status,
}: {
  semesterId: string;
  academicYearId: string;
  status: SemesterStatus;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Select
      defaultValue={status}
      disabled={pending}
      items={STATUS_OPTIONS.map((option) => ({ value: option, label: option }))}
      onValueChange={(value) =>
        startTransition(() => {
          setSemesterStatus(semesterId, academicYearId, value as SemesterStatus);
        })
      }
    >
      <SelectTrigger size="sm" className="w-32">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
