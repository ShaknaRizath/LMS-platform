import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SemesterForm } from "@/components/admin/semester-form";
import { SemesterStatusSelect } from "@/components/admin/semester-status-select";
import { createSemester, setActiveAcademicYear } from "@/lib/actions/admin/academic-year.actions";

export default async function AcademicYearDetailPage({
  params,
}: {
  params: Promise<{ academicYearId: string }>;
}) {
  const { academicYearId } = await params;

  const academicYear = await prisma.academicYear.findUnique({
    where: { id: academicYearId },
    include: { semesters: { orderBy: { semesterNumber: "asc" } } },
  });

  if (!academicYear) notFound();

  const setActiveAction = setActiveAcademicYear.bind(null, academicYear.id);
  const createSemesterAction = createSemester.bind(null, academicYear.id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{academicYear.name}</h1>
          <p className="text-muted-foreground">
            {academicYear.startDate.toLocaleDateString()} – {academicYear.endDate.toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {academicYear.isActive && <Badge variant="secondary">Active year</Badge>}
          {!academicYear.isActive && (
            <form action={setActiveAction}>
              <Button type="submit" variant="outline">
                Set as active year
              </Button>
            </form>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semesters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {academicYear.semesters.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Registration window</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicYear.semesters.map((semester) => (
                  <TableRow key={semester.id}>
                    <TableCell className="font-medium">{semester.name}</TableCell>
                    <TableCell>
                      {semester.startDate.toLocaleDateString()} – {semester.endDate.toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {semester.registrationOpensAt && semester.registrationClosesAt
                        ? `${semester.registrationOpensAt.toLocaleDateString()} – ${semester.registrationClosesAt.toLocaleDateString()}`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {semester.feeAmount ? `LKR ${semester.feeAmount.toString()}` : "—"}
                    </TableCell>
                    <TableCell>
                      <SemesterStatusSelect
                        semesterId={semester.id}
                        academicYearId={academicYear.id}
                        status={semester.status}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <SemesterForm action={createSemesterAction} />
        </CardContent>
      </Card>
    </div>
  );
}
