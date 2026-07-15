import "server-only";
import { prisma } from "@/lib/db/prisma";

export type ModuleGradeCategoryBreakdown = {
  categoryId: string;
  name: string;
  weightPercent: number;
  percentage: number | null;
};

export type ModuleGradeResult = {
  percentage: number | null;
  isComplete: boolean;
  categories: ModuleGradeCategoryBreakdown[];
};

export async function computeModuleGrade(moduleId: string, studentId: string): Promise<ModuleGradeResult> {
  const [categories, assignments, quizzes] = await Promise.all([
    prisma.assessmentCategory.findMany({ where: { moduleId }, orderBy: { name: "asc" } }),
    prisma.contentItem.findMany({
      where: { isAssignment: true, week: { moduleId } },
      select: {
        assessmentCategoryId: true,
        submissions: { where: { studentId }, select: { grade: true } },
      },
    }),
    prisma.quiz.findMany({
      where: { moduleId },
      select: {
        assessmentCategoryId: true,
        attempts: {
          where: { studentId, resultsPublishedAt: { not: null } },
          select: { pointsEarned: true, totalPoints: true },
        },
      },
    }),
  ]);

  const earnedByCategory = new Map<string, number>();
  const possibleByCategory = new Map<string, number>();

  function addToCategory(categoryId: string | null, earned: number, possible: number) {
    if (!categoryId) return;
    earnedByCategory.set(categoryId, (earnedByCategory.get(categoryId) ?? 0) + earned);
    possibleByCategory.set(categoryId, (possibleByCategory.get(categoryId) ?? 0) + possible);
  }

  for (const item of assignments) {
    const graded = item.submissions.find((s) => s.grade !== null);
    if (graded?.grade != null) {
      addToCategory(item.assessmentCategoryId, Number(graded.grade), 100);
    }
  }

  for (const quiz of quizzes) {
    const best = quiz.attempts
      .filter((a) => a.pointsEarned !== null && a.totalPoints !== null && a.totalPoints > 0)
      .sort((a, b) => b.pointsEarned! / b.totalPoints! - a.pointsEarned! / a.totalPoints!)[0];
    if (best) {
      addToCategory(quiz.assessmentCategoryId, best.pointsEarned!, best.totalPoints!);
    }
  }

  const breakdown: ModuleGradeCategoryBreakdown[] = categories.map((category) => {
    const possible = possibleByCategory.get(category.id) ?? 0;
    const earned = earnedByCategory.get(category.id) ?? 0;
    return {
      categoryId: category.id,
      name: category.name,
      weightPercent: category.weightPercent,
      percentage: possible > 0 ? (earned / possible) * 100 : null,
    };
  });

  const populated = breakdown.filter((c) => c.percentage !== null);
  const populatedWeightTotal = populated.reduce((sum, c) => sum + c.weightPercent, 0);
  const percentage =
    populated.length > 0 && populatedWeightTotal > 0
      ? populated.reduce((sum, c) => sum + c.percentage! * (c.weightPercent / populatedWeightTotal), 0)
      : null;

  const configuredWeightTotal = categories.reduce((sum, c) => sum + c.weightPercent, 0);
  const isComplete = configuredWeightTotal === 100 && categories.length > 0 && populated.length === categories.length;

  return { percentage, isComplete, categories: breakdown };
}
