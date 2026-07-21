import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ACADEMIC_PALETTE } from "@/components/academic/palette";
import type { ModuleQualityRow } from "@/lib/analytics/module-quality";

export function ModuleQualityTable({ rows }: { rows: ModuleQualityRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Quality Monitoring</CardTitle>
        <CardDescription>Average grade across graded assignments, lowest first</CardDescription>
      </CardHeader>
      <div className="px-(--card-spacing) pb-(--card-spacing)">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active modules yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Avg. grade</TableHead>
                <TableHead>Pass rate</TableHead>
                <TableHead>Graded</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, index) => {
                const color = ACADEMIC_PALETTE[index % ACADEMIC_PALETTE.length];
                return (
                  <TableRow key={row.moduleId}>
                    <TableCell>
                      <Link href={`/academic/analytics`} className="hover:underline">
                        <p className="font-medium text-foreground">{row.title}</p>
                        <p className="text-xs text-muted-foreground">{row.code}</p>
                      </Link>
                    </TableCell>
                    <TableCell>
                      {row.averageGrade === null ? (
                        <span className="text-sm text-muted-foreground">—</span>
                      ) : (
                        <span
                          className="rounded-full px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: color.bg, color: color.fg }}
                        >
                          {row.averageGrade.toFixed(1)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{row.passRate === null ? "—" : `${Math.round(row.passRate)}%`}</TableCell>
                    <TableCell>{row.gradedCount}</TableCell>
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
