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

export type StaffDirectoryRow = {
  id: string;
  name: string;
  department: string | null;
  isActive: boolean;
};

export function StaffDirectoryPreview({ rows }: { rows: StaffDirectoryRow[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Staff Directory</CardTitle>
            <CardDescription>Every non-student account</CardDescription>
          </div>
          <Link
            href="/hr/staff"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <div className="px-(--card-spacing) pb-(--card-spacing)">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No staff accounts yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link href={`/hr/staff/${row.id}`} className="font-medium hover:underline">
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.department ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={row.isActive ? "secondary" : "destructive"}>
                      {row.isActive ? "Active" : "Inactive"}
                    </Badge>
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
