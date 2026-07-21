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
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Wallet } from "lucide-react";

export type PaymentVerificationRow = {
  id: string;
  registrationId: string;
  studentName: string;
  programName: string | null;
  amount: string;
  submittedAt: Date;
  status: string;
};

export function PaymentVerificationTable({ rows }: { rows: PaymentVerificationRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Verification Queue</CardTitle>
        <CardDescription>Payments awaiting verification, oldest first</CardDescription>
      </CardHeader>
      <div className="px-(--card-spacing) pb-(--card-spacing)">
        {rows.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Wallet />
              </EmptyMedia>
              <EmptyTitle>No pending payments</EmptyTitle>
              <EmptyDescription>All uploaded payments have been reviewed.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-40 truncate">
                    <Link href={`/finance/registrations/${row.registrationId}`} className="font-medium hover:underline">
                      {row.studentName}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-40 truncate">{row.programName ?? "—"}</TableCell>
                  <TableCell>LKR {row.amount}</TableCell>
                  <TableCell>{row.submittedAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.status}</Badge>
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
