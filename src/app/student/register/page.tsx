import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { RegisterSelector } from "@/components/student/register-selector";
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

  const program = await prisma.program.findUniqueOrThrow({ where: { id: student.programId } });

  const activeAcademicYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
  const activeSemesters = activeAcademicYear
    ? await prisma.semester.findMany({
        where: { academicYearId: activeAcademicYear.id, status: "ACTIVE" },
        include: { academicYear: true },
        orderBy: { semesterNumber: "asc" },
      })
    : [];

  if (activeSemesters.length === 0) {
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

  const semesterIds = activeSemesters.map((s) => s.id);

  const [modules, existingRegistrations, fees] = await Promise.all([
    prisma.module.findMany({
      where: { programId: student.programId, semesterId: { in: semesterIds }, isActive: true },
      orderBy: { code: "asc" },
    }),
    prisma.semesterRegistration.findMany({
      where: { studentId: student.id, semesterId: { in: semesterIds } },
      select: { id: true, semesterId: true, status: true },
    }),
    prisma.programCurriculumFee.findMany({ where: { programId: student.programId } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Semester registration</h1>
        <p className="text-muted-foreground">
          {program.name} — select the year and semester you&apos;re enrolling for.
        </p>
      </div>

      <RegisterSelector
        durationYears={program.durationYears}
        semesters={activeSemesters.map((s) => ({
          id: s.id,
          semesterNumber: s.semesterNumber,
          label: `${s.academicYear.name} — ${s.name}`,
        }))}
        modules={modules.map((m) => ({
          id: m.id,
          code: m.code,
          title: m.title,
          credits: m.credits,
          yearLevel: m.yearLevel,
          semesterId: m.semesterId,
        }))}
        existingRegistrations={existingRegistrations.map((r) => ({
          semesterId: r.semesterId,
          registrationId: r.id,
          status: r.status,
        }))}
        fees={fees.map((f) => ({
          yearLevel: f.yearLevel,
          semesterNumber: f.semesterNumber,
          amount: f.amount.toString(),
        }))}
      />
    </div>
  );
}
