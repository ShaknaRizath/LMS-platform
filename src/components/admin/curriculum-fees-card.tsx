import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProgramCurriculumFeeForm } from "@/components/admin/program-curriculum-fee-form";

export function CurriculumFeesCard({
  programId,
  durationYears,
  semesterNumbers,
  existingFees,
}: {
  programId: string;
  durationYears: number;
  semesterNumbers: number[];
  existingFees: { yearLevel: number; semesterNumber: number; amount: { toString(): string } }[];
}) {
  const feeMap = new Map(existingFees.map((f) => [`${f.yearLevel}-${f.semesterNumber}`, f.amount.toString()]));
  const yearLevels = Array.from({ length: durationYears }, (_, i) => i + 1);

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>Curriculum fees</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          One fee per year of study and semester — this is what students of this program pay for
          that year/semester regardless of which academic year it falls in.
        </p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Fee (LKR)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {yearLevels.flatMap((yearLevel) =>
              semesterNumbers.map((semesterNumber) => (
                <TableRow key={`${yearLevel}-${semesterNumber}`}>
                  <TableCell>Year {yearLevel}</TableCell>
                  <TableCell>Semester {semesterNumber}</TableCell>
                  <TableCell>
                    <ProgramCurriculumFeeForm
                      programId={programId}
                      yearLevel={yearLevel}
                      semesterNumber={semesterNumber}
                      currentAmount={feeMap.get(`${yearLevel}-${semesterNumber}`) ?? null}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
