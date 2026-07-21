import "server-only";
import { prisma } from "@/lib/db/prisma";

export type ModuleQualityRow = {
  moduleId: string;
  code: string;
  title: string;
  averageGrade: number | null;
  passRate: number | null;
  gradedCount: number;
};

/**
 * Per-module grade quality snapshot for the Academic Director's "Module Quality
 * Monitoring" widget — average grade and pass rate across all graded assignment
 * submissions for each active module, all-time (not date-ranged, unlike
 * src/lib/analytics/queries.ts which is institution-wide, not per-module).
 *
 * Deliberately two flat bulk queries + in-memory group-by, not a per-student loop —
 * computeModuleGrade/computeStudentAcademicRecord are per-student and would mean one
 * DB round-trip per enrolled student per module, which is the exact connection-pool
 * exhaustion pattern flagged elsewhere in this codebase. This mirrors the same
 * bulk-fetch-then-group approach already used by getModulesByAbsenteeism /
 * getTopModulesByDiscussionActivity in queries.ts.
 */
export async function getModuleQualitySummary(): Promise<ModuleQualityRow[]> {
  const [modules, gradedSubmissions] = await Promise.all([
    prisma.module.findMany({
      where: { isActive: true },
      select: { id: true, code: true, title: true },
    }),
    prisma.submission.findMany({
      where: { grade: { not: null } },
      select: { grade: true, contentItem: { select: { week: { select: { moduleId: true } } } } },
    }),
  ]);

  const gradesByModule = new Map<string, number[]>();
  for (const submission of gradedSubmissions) {
    const moduleId = submission.contentItem.week.moduleId;
    const grades = gradesByModule.get(moduleId) ?? [];
    grades.push(Number(submission.grade));
    gradesByModule.set(moduleId, grades);
  }

  const rows: ModuleQualityRow[] = modules.map((module) => {
    const grades = gradesByModule.get(module.id) ?? [];
    const averageGrade = grades.length ? grades.reduce((sum, g) => sum + g, 0) / grades.length : null;
    const passRate = grades.length ? (grades.filter((g) => g >= 50).length / grades.length) * 100 : null;
    return { moduleId: module.id, code: module.code, title: module.title, averageGrade, passRate, gradedCount: grades.length };
  });

  // Modules with the lowest average grade first (most in need of attention); modules
  // with no graded work yet sort last rather than being hidden — a real, visible gap.
  return rows.sort((a, b) => {
    if (a.averageGrade === null && b.averageGrade === null) return 0;
    if (a.averageGrade === null) return 1;
    if (b.averageGrade === null) return -1;
    return a.averageGrade - b.averageGrade;
  });
}
