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
import type { ModuleAssignmentStatusRow } from "@/lib/scheduling/module-assignment-status";

export function ModuleAssignmentTable({ rows }: { rows: ModuleAssignmentStatusRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Assignment Status</CardTitle>
        <CardDescription>Lecturer coverage and scheduling gaps, needs attention first</CardDescription>
      </CardHeader>
      <div className="px-(--card-spacing) pb-(--card-spacing)">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active modules yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>Lecturer</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.moduleId}>
                  <TableCell className="max-w-48">
                    <Link href={`/coordinator/timetables/${row.moduleId}`} className="hover:underline">
                      <p className="truncate font-medium text-foreground">{row.code}</p>
                      <p className="truncate text-xs text-muted-foreground">{row.title}</p>
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-32 truncate">{row.lecturerNames}</TableCell>
                  <TableCell>{row.sessionCount}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "OK" ? "secondary" : "outline"}>{row.status}</Badge>
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
