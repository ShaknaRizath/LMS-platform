import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { assertLecturerOwnsModule } from "@/lib/auth/ownership";
import { prisma } from "@/lib/db/prisma";
import { computeModuleGrade } from "@/lib/grades/module-grade";
import { letterAndPointsFor } from "@/lib/grades/gpa";
import { AssessmentCategoryManager } from "@/components/lecturer/assessment-category-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function LecturerGradeBookPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  const module_ = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!module_) notFound();

  const [categories, enrollments] = await Promise.all([
    prisma.assessmentCategory.findMany({ where: { moduleId }, orderBy: { name: "asc" } }),
    prisma.enrollment.findMany({
      where: { moduleId, status: "ACTIVE" },
      include: { student: true },
      orderBy: { student: { firstName: "asc" } },
    }),
  ]);

  // Sequential, not Promise.all(map(...)) — each computeModuleGrade fires its own
  // 3-query Promise.all, so a roster of N students would fan out to N * 3 simultaneous
  // connections, easily exceeding the pool's connection_limit for a large class.
  const grades: Awaited<ReturnType<typeof computeModuleGrade>>[] = [];
  for (const enrollment of enrollments) {
    grades.push(await computeModuleGrade(moduleId, enrollment.studentId));
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Grade Book</h1>
        <p className="text-muted-foreground">{module_.code}</p>
      </div>

      <AssessmentCategoryManager moduleId={moduleId} categories={categories} />

      <Card>
        <CardHeader>
          <CardTitle>Student grades</CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add at least one assessment category above to start seeing computed grades.
            </p>
          ) : enrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active students enrolled in this module yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    {categories.map((category) => (
                      <TableHead key={category.id}>
                        {category.name} ({category.weightPercent}%)
                      </TableHead>
                    ))}
                    <TableHead>Overall</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment, index) => {
                    const grade = grades[index];
                    const letterPoints = grade.percentage !== null ? letterAndPointsFor(grade.percentage) : null;
                    return (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          {enrollment.student.firstName} {enrollment.student.lastName}
                        </TableCell>
                        {categories.map((category) => {
                          const cell = grade.categories.find((c) => c.categoryId === category.id);
                          return (
                            <TableCell key={category.id}>
                              {cell?.percentage !== null && cell?.percentage !== undefined
                                ? `${Math.round(cell.percentage)}%`
                                : "—"}
                            </TableCell>
                          );
                        })}
                        <TableCell>
                          {grade.percentage !== null ? (
                            <span className="flex items-center gap-2">
                              {Math.round(grade.percentage)}% ({letterPoints?.letter})
                              {!grade.isComplete && (
                                <Badge variant="outline" className="shrink-0">
                                  In progress
                                </Badge>
                              )}
                            </span>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
