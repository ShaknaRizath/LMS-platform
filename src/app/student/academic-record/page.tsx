import { requireRole } from "@/lib/auth/rbac";
import { computeStudentAcademicRecord } from "@/lib/grades/gpa";
import { StatCard } from "@/components/shared/stat-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function StudentAcademicRecordPage() {
  const student = await requireRole(["STUDENT"]);
  const record = await computeStudentAcademicRecord(student.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Academic Record</h1>
        <p className="text-muted-foreground">Your grades and GPA across every module you've taken.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard
          label="Cumulative GPA"
          value={record.cumulativeGpa !== null ? record.cumulativeGpa.toFixed(2) : "—"}
        />
        <StatCard label="Semesters" value={record.semesters.length} />
      </div>

      {record.semesters.length === 0 ? (
        <p className="text-sm text-muted-foreground">No enrollments yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {record.semesters.map((semester) => (
            <Card key={semester.semesterId}>
              <CardHeader>
                <CardTitle>
                  {semester.academicYearName} — {semester.semesterName}
                </CardTitle>
                <CardDescription>
                  Semester GPA: {semester.semesterGpa !== null ? semester.semesterGpa.toFixed(2) : "—"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Overall</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {semester.modules.map((module_) => (
                      <TableRow key={module_.moduleId}>
                        <TableCell>
                          {module_.code} — {module_.title}
                        </TableCell>
                        <TableCell>{module_.credits ?? "—"}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {module_.percentage !== null
                                  ? `${Math.round(module_.percentage)}%${module_.letter ? ` (${module_.letter})` : ""}`
                                  : "—"}
                              </span>
                              {!module_.isComplete && (
                                <Badge variant="secondary">In progress</Badge>
                              )}
                            </div>
                            {module_.categories.length > 0 && (
                              <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                                {module_.categories.map((category) => (
                                  <span key={category.categoryId}>
                                    {category.name} ({category.weightPercent}%):{" "}
                                    {category.percentage !== null ? `${Math.round(category.percentage)}%` : "—"}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
