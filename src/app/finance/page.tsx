import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
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

export default async function FinanceDashboardPage() {
  const payments = await prisma.paymentRecord.findMany({
    where: { verificationStatus: "PENDING" },
    include: { registration: { include: { student: true } } },
    orderBy: { uploadedAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Finance</h1>
        <p className="text-muted-foreground">Payments awaiting verification.</p>
      </div>

      {payments.length === 0 ? (
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
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <Link
                      href={`/finance/registrations/${payment.registrationId}`}
                      className="font-medium hover:underline"
                    >
                      {payment.registration.student.firstName} {payment.registration.student.lastName}
                    </Link>
                  </TableCell>
                  <TableCell>LKR {payment.amount.toString()}</TableCell>
                  <TableCell>{payment.uploadedAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.verificationStatus}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
