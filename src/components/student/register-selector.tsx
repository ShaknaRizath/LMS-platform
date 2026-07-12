"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useActionState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Field, FieldLabel } from "@/components/ui/field";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RegistrationStatusBadge } from "@/components/shared/registration-status-badge";
import { createRegistration } from "@/lib/actions/student/registration.actions";
import type { ActionState } from "@/lib/actions/action-state";
import type { RegistrationStatus } from "@/generated/prisma/enums";

type SemesterOption = { id: string; semesterNumber: number; label: string };
type ModuleOption = {
  id: string;
  code: string;
  title: string;
  credits: number | null;
  yearLevel: number;
  semesterId: string;
};
type RegistrationLookup = { semesterId: string; registrationId: string; status: RegistrationStatus };
type FeeOption = { yearLevel: number; semesterNumber: number; amount: string };

export function RegisterSelector({
  durationYears,
  semesters,
  modules,
  existingRegistrations,
  fees,
}: {
  durationYears: number;
  semesters: SemesterOption[];
  modules: ModuleOption[];
  existingRegistrations: RegistrationLookup[];
  fees: FeeOption[];
}) {
  const [yearLevel, setYearLevel] = useState<string>("");
  const [semesterNumber, setSemesterNumber] = useState<string>(
    semesters.length === 1 ? String(semesters[0].semesterNumber) : ""
  );
  const [state, formAction, pending] = useActionState<ActionState, FormData>(createRegistration, undefined);

  const selectedSemester = semesters.find((s) => String(s.semesterNumber) === semesterNumber);
  const existingRegistration = selectedSemester
    ? existingRegistrations.find((r) => r.semesterId === selectedSemester.id)
    : undefined;
  const matchingModules = useMemo(() => {
    if (!selectedSemester || !yearLevel) return [];
    return modules.filter((m) => m.semesterId === selectedSemester.id && m.yearLevel === Number(yearLevel));
  }, [modules, selectedSemester, yearLevel]);
  const fee = selectedSemester
    ? fees.find((f) => f.yearLevel === Number(yearLevel) && f.semesterNumber === selectedSemester.semesterNumber)
    : undefined;

  const yearOptions = Array.from({ length: durationYears }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-6">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Select year and semester</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Year of study</FieldLabel>
            <Select
              value={yearLevel}
              items={yearOptions.map((y) => ({ value: String(y), label: `Year ${y}` }))}
              onValueChange={(value) => setYearLevel(value as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    Year {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Semester</FieldLabel>
            <Select
              value={semesterNumber}
              items={semesters.map((s) => ({ value: String(s.semesterNumber), label: s.label }))}
              onValueChange={(value) => setSemesterNumber(value as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a semester" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map((s) => (
                  <SelectItem key={s.id} value={String(s.semesterNumber)}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      {yearLevel && selectedSemester && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>
              Year {yearLevel} — {selectedSemester.label}
            </CardTitle>
            <CardDescription>
              {fee ? `Fee: LKR ${fee.amount}` : "Fee not set yet — contact your administrator."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {existingRegistration ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <RegistrationStatusBadge status={existingRegistration.status} />
                </div>
                <Button
                  nativeButton={false}
                  render={<Link href={`/student/registrations/${existingRegistration.registrationId}`} />}
                >
                  View registration
                </Button>
              </>
            ) : matchingModules.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No modules are available for this year and semester yet. Contact your administrator.
              </p>
            ) : (
              <form action={formAction} className="flex flex-col gap-4">
                <input type="hidden" name="yearLevel" value={yearLevel} />
                <input type="hidden" name="semesterNumber" value={semesterNumber} />
                <div>
                  <p className="mb-2 text-sm font-medium">
                    These modules will be registered automatically:
                  </p>
                  <ul className="flex flex-col gap-1">
                    {matchingModules.map((m) => (
                      <li key={m.id} className="text-sm">
                        {m.code} — {m.title}
                        {m.credits ? ` (${m.credits} credits)` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
                {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
                <Button type="submit" disabled={pending}>
                  {pending ? "Submitting..." : "Submit registration"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
