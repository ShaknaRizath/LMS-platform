import { requireRole } from "@/lib/auth/rbac";
import { getLecturerWorkloads } from "@/lib/workload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Users } from "lucide-react";

export default async function CoordinatorWorkloadPage() {
  await requireRole(["PROGRAM_COORDINATOR"]);

  const rows = await getLecturerWorkloads();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Lecturer Workload</h1>
        <p className="text-muted-foreground">
          Modules, credits, and scheduled weekly teaching hours per lecturer.
        </p>
      </div>

      {rows.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Users />
            </EmptyMedia>
            <EmptyTitle>No active lecturers</EmptyTitle>
            <EmptyDescription>Lecturer workload will appear here once lecturers are active.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lecturer</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Total credits</TableHead>
                <TableHead>Weekly hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.lecturerId}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.moduleCount}</TableCell>
                  <TableCell>{row.totalCredits}</TableCell>
                  <TableCell>{row.weeklyHours.toFixed(1)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
