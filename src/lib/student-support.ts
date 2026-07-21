import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { DisciplineStatus } from "@/generated/prisma/client";

export type RecentDisciplineCase = {
  id: string;
  studentId: string;
  studentName: string;
  incidentDate: Date;
  status: DisciplineStatus;
};

export type DisciplineSupportSummary = {
  totalStudents: number;
  studentsWithCases: number;
  studentsNeedingAttention: number;
  recentCases: RecentDisciplineCase[];
};

/**
 * Coordinator dashboard "Student Support" preview — distinguishes the full history
 * (studentsWithCases, all-time) from what's actionable right now (studentsNeedingAttention:
 * students with at least one still-OPEN case), rather than one flat case count.
 */
export async function getDisciplineSupportSummary(): Promise<DisciplineSupportSummary> {
  const [totalStudents, cases] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.disciplineCase.findMany({
      include: { student: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const studentIdsWithCases = new Set(cases.map((disciplineCase) => disciplineCase.studentId));
  const studentIdsNeedingAttention = new Set(
    cases.filter((disciplineCase) => disciplineCase.status === "OPEN").map((disciplineCase) => disciplineCase.studentId)
  );

  const recentCases: RecentDisciplineCase[] = cases.slice(0, 5).map((disciplineCase) => ({
    id: disciplineCase.id,
    studentId: disciplineCase.studentId,
    studentName: `${disciplineCase.student.firstName} ${disciplineCase.student.lastName}`,
    incidentDate: disciplineCase.incidentDate,
    status: disciplineCase.status,
  }));

  return {
    totalStudents,
    studentsWithCases: studentIdsWithCases.size,
    studentsNeedingAttention: studentIdsNeedingAttention.size,
    recentCases,
  };
}
