import "server-only";
import { prisma } from "@/lib/db/prisma";
import { computeModuleGrade, type ModuleGradeCategoryBreakdown } from "@/lib/grades/module-grade";

export const GRADE_BANDS = [
  { min: 90, letter: "A", points: 4.0 },
  { min: 85, letter: "A-", points: 3.7 },
  { min: 80, letter: "B+", points: 3.3 },
  { min: 75, letter: "B", points: 3.0 },
  { min: 70, letter: "B-", points: 2.7 },
  { min: 65, letter: "C+", points: 2.3 },
  { min: 60, letter: "C", points: 2.0 },
  { min: 55, letter: "C-", points: 1.7 },
  { min: 50, letter: "D", points: 1.0 },
  { min: 0, letter: "F", points: 0.0 },
] as const;

export function letterAndPointsFor(percentage: number): { letter: string; points: number } {
  const band = GRADE_BANDS.find((b) => percentage >= b.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1];
  return { letter: band.letter, points: band.points };
}

export type AcademicRecordModule = {
  moduleId: string;
  code: string;
  title: string;
  credits: number | null;
  percentage: number | null;
  letter: string | null;
  points: number | null;
  isComplete: boolean;
  categories: ModuleGradeCategoryBreakdown[];
};

export type AcademicRecordSemester = {
  semesterId: string;
  semesterName: string;
  academicYearName: string;
  modules: AcademicRecordModule[];
  semesterGpa: number | null;
};

export type AcademicRecord = {
  semesters: AcademicRecordSemester[];
  cumulativeGpa: number | null;
};

function weightedGpa(modules: AcademicRecordModule[]): number | null {
  const eligible = modules.filter((m) => m.isComplete && m.credits != null && m.points != null);
  const totalCredits = eligible.reduce((sum, m) => sum + (m.credits ?? 0), 0);
  if (totalCredits === 0) return null;
  const totalPoints = eligible.reduce((sum, m) => sum + m.points! * (m.credits ?? 0), 0);
  return totalPoints / totalCredits;
}

export async function computeStudentAcademicRecord(studentId: string): Promise<AcademicRecord> {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: { module: { include: { semester: { include: { academicYear: true } } } } },
    orderBy: { module: { semester: { startDate: "desc" } } },
  });

  // Sequential, not Promise.all(map(...)) — each computeModuleGrade fires its own
  // 3-query Promise.all, so running all enrollments concurrently would fan out to
  // enrollments.length * 3 simultaneous connections, easily exceeding the pool's
  // connection_limit for any student with more than a handful of modules.
  const moduleGrades: Awaited<ReturnType<typeof computeModuleGrade>>[] = [];
  for (const enrollment of enrollments) {
    moduleGrades.push(await computeModuleGrade(enrollment.moduleId, studentId));
  }

  const bySemester = new Map<string, AcademicRecordSemester>();
  enrollments.forEach((enrollment, index) => {
    const grade = moduleGrades[index];
    const letterPoints = grade.percentage !== null ? letterAndPointsFor(grade.percentage) : null;

    const moduleRow: AcademicRecordModule = {
      moduleId: enrollment.moduleId,
      code: enrollment.module.code,
      title: enrollment.module.title,
      credits: enrollment.module.credits,
      percentage: grade.percentage,
      letter: letterPoints?.letter ?? null,
      points: letterPoints?.points ?? null,
      isComplete: grade.isComplete,
      categories: grade.categories,
    };

    const semesterId = enrollment.module.semesterId;
    const existing = bySemester.get(semesterId);
    if (existing) {
      existing.modules.push(moduleRow);
    } else {
      bySemester.set(semesterId, {
        semesterId,
        semesterName: enrollment.module.semester.name,
        academicYearName: enrollment.module.semester.academicYear.name,
        modules: [moduleRow],
        semesterGpa: null,
      });
    }
  });

  const semesters = Array.from(bySemester.values()).map((semester) => ({
    ...semester,
    semesterGpa: weightedGpa(semester.modules),
  }));

  const allModules = semesters.flatMap((s) => s.modules);
  const cumulativeGpa = weightedGpa(allModules);

  return { semesters, cumulativeGpa };
}
