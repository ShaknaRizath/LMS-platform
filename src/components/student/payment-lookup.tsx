"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
import type { RegistrationStatus } from "@/generated/prisma/enums";

type AcademicYearOption = { id: string; name: string };
type SemesterOption = { id: string; name: string; academicYearId: string; semesterNumber: number };
type RegistrationLookup = {
  semesterId: string;
  registrationId: string;
  status: RegistrationStatus;
  yearLevel: number;
};
type FeeOption = { yearLevel: number; semesterNumber: number; amount: string };

export function PaymentLookup({
  academicYears,
  semesters,
  registrations,
  fees,
}: {
  academicYears: AcademicYearOption[];
  semesters: SemesterOption[];
  registrations: RegistrationLookup[];
  fees: FeeOption[];
}) {
  const [academicYearId, setAcademicYearId] = useState(academicYears[0]?.id ?? "");
  const [semesterId, setSemesterId] = useState("");

  const semesterOptions = useMemo(
    () => semesters.filter((s) => s.academicYearId === academicYearId),
    [semesters, academicYearId]
  );

  const selectedSemester = semesterOptions.find((s) => s.id === semesterId);
  const registration = registrations.find((r) => r.semesterId === semesterId);
  const fee =
    registration && selectedSemester
      ? fees.find(
          (f) => f.yearLevel === registration.yearLevel && f.semesterNumber === selectedSemester.semesterNumber
        )
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Select semester</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Field>
            <FieldLabel>Academic year</FieldLabel>
            <Select
              value={academicYearId}
              items={academicYears.map((y) => ({ value: y.id, label: y.name }))}
              onValueChange={(value) => {
                setAcademicYearId(value as string);
                setSemesterId("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field>
            <FieldLabel>Semester</FieldLabel>
            <Select
              value={semesterId}
              disabled={semesterOptions.length === 0}
              items={semesterOptions.map((s) => ({ value: s.id, label: s.name }))}
              onValueChange={(value) => setSemesterId(value as string)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a semester" />
              </SelectTrigger>
              <SelectContent>
                {semesterOptions.map((semester) => (
                  <SelectItem key={semester.id} value={semester.id}>
                    {semester.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </CardContent>
      </Card>

      {selectedSemester && (
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>
              {registration ? `Year ${registration.yearLevel} — ` : ""}
              {selectedSemester.name}
            </CardTitle>
            {registration && (
              <CardDescription>{fee ? `Fee: LKR ${fee.amount}` : "Fee not set yet"}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!registration && (
              <>
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t registered for this semester yet. Register (choosing your year and
                  semester there) first, then come back here to pay.
                </p>
                <Button nativeButton={false} render={<Link href="/student/register" />}>
                  Go to Register
                </Button>
              </>
            )}

            {registration && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <RegistrationStatusBadge status={registration.status} />
                </div>

                {registration.status === "PAYMENT_PENDING" && (
                  <Button
                    nativeButton={false}
                    render={<Link href={`/student/register/${registration.registrationId}/payment`} />}
                  >
                    Pay now
                  </Button>
                )}

                {registration.status === "REJECTED" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Your registration was rejected. Resubmit it before paying again.
                    </p>
                    <Button
                      nativeButton={false}
                      render={<Link href={`/student/registrations/${registration.registrationId}`} />}
                    >
                      Review and resubmit
                    </Button>
                  </>
                )}

                {registration.status === "PENDING" && (
                  <p className="text-sm text-muted-foreground">
                    Your payment has been submitted and is awaiting admin/finance approval.
                  </p>
                )}

                {registration.status === "APPROVED" && (
                  <p className="text-sm text-muted-foreground">
                    This semester is already paid for and approved.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
