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
import { Badge } from "@/components/ui/badge";
import type { ProgramFeeStatusRow } from "@/lib/finance/reports";

export function ProgramFeeSummaryCard({ rows }: { rows: ProgramFeeStatusRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Program Fee Summary</CardTitle>
        <CardDescription>Curriculum fee coverage per active program</CardDescription>
      </CardHeader>
      <div className="px-(--card-spacing) pb-(--card-spacing)">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active programs.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Fee Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.programId}>
                  <TableCell className="max-w-48 truncate">
                    <Link href={`/finance/programs/${row.programId}`} className="font-medium hover:underline">
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.durationYears} year(s)</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "Fee configured" ? "secondary" : "outline"}>{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
}
