import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LECTURER_PALETTE } from "@/components/lecturer/palette";

export type MyModuleRow = {
  id: string;
  code: string;
  title: string;
  enrolledStudents: number;
  lessons: number;
  credits: number | null;
};

export function MyModulesTable({ modules }: { modules: MyModuleRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Modules</CardTitle>
      </CardHeader>
      <div className="px-(--card-spacing) pb-(--card-spacing)">
        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No modules assigned yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Credits</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module, index) => {
                const color = LECTURER_PALETTE[index % LECTURER_PALETTE.length];
                return (
                  <TableRow key={module.id}>
                    <TableCell>
                      <Link href={`/lecturer/modules/${module.id}`} className="hover:underline">
                        <p className="font-medium text-foreground">{module.title}</p>
                        <p className="text-xs text-muted-foreground">{module.code}</p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ backgroundColor: color.bg, color: color.fg }}
                      >
                        {module.enrolledStudents} students
                      </span>
                    </TableCell>
                    <TableCell>{module.lessons}</TableCell>
                    <TableCell>{module.credits ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
}
