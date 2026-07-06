import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RegisterForm } from "@/components/student/register-form";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { ClipboardList } from "lucide-react";

export default async function RegisterPage() {
  const student = await requireRole(["STUDENT"]);

  if (!student.programId) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ClipboardList />
          </EmptyMedia>
          <EmptyTitle>No program assigned</EmptyTitle>
          <EmptyDescription>
            Contact your administrator to have a program assigned to your account before registering.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const openSemester = await prisma.semester.findFirst({
    where: {
      status: "ACTIVE",
      modules: { some: { programId: student.programId, isActive: true } },
    },
    include: { academicYear: true },
    orderBy: { startDate: "desc" },
  });

  if (!openSemester) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <ClipboardList />
          </EmptyMedia>
          <EmptyTitle>No open registration right now</EmptyTitle>
          <EmptyDescription>Check back once the next semester&apos;s registration opens.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const existingRegistration = await prisma.semesterRegistration.findUnique({
    where: { studentId_semesterId: { studentId: student.id, semesterId: openSemester.id } },
  });

  if (existingRegistration) {
    return (
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>You&apos;re already registered</CardTitle>
          <CardDescription>
            You have a registration for {openSemester.academicYear.name} — {openSemester.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button nativeButton={false} render={<Link href={`/student/registrations/${existingRegistration.id}`} />}>
            View registration
          </Button>
        </CardContent>
      </Card>
    );
  }

  const modules = await prisma.module.findMany({
    where: { programId: student.programId, semesterId: openSemester.id, isActive: true },
    orderBy: { code: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Semester registration</h1>
        <p className="text-muted-foreground">
          {openSemester.academicYear.name} — {openSemester.name}
          {openSemester.feeAmount ? ` · Fee: LKR ${openSemester.feeAmount.toString()}` : ""}
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Select your modules</CardTitle>
          <CardDescription>You&apos;ll upload your payment receipt in the next step.</CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm semesterId={openSemester.id} modules={modules} />
        </CardContent>
      </Card>
    </div>
  );
}
