import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { decideLeaveRequest } from "@/lib/actions/staff/leave.actions";
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
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { LeaveType } from "@/generated/prisma/enums";

const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  ANNUAL: "Annual",
  SICK: "Sick",
  UNPAID: "Unpaid",
  OTHER: "Other",
};

export type PendingLeaveRow = {
  id: string;
  staffId: string;
  staffName: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
};

export function PendingLeaveTable({ rows }: { rows: PendingLeaveRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Requests Awaiting Approval</CardTitle>
        <CardDescription>Oldest first</CardDescription>
      </CardHeader>
      <div className="px-(--card-spacing) pb-(--card-spacing)">
        {rows.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarClock />
              </EmptyMedia>
              <EmptyTitle>Nothing pending</EmptyTitle>
              <EmptyDescription>Staff leave requests will appear here for approval.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-36 truncate font-medium">{row.staffName}</TableCell>
                  <TableCell>{LEAVE_TYPE_LABELS[row.type]}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {row.startDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}–
                    {row.endDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">Pending</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <form action={decideLeaveRequest.bind(null, row.id, "APPROVED")}>
                        <Button type="submit" size="sm" variant="outline">
                          Approve
                        </Button>
                      </form>
                      <form action={decideLeaveRequest.bind(null, row.id, "REJECTED")}>
                        <Button type="submit" size="sm" variant="outline">
                          Reject
                        </Button>
                      </form>
                      <Button
                        nativeButton={false}
                        render={<Link href={`/hr/staff/${row.staffId}`} />}
                        size="sm"
                        variant="ghost"
                      >
                        View Details
                      </Button>
                    </div>
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
