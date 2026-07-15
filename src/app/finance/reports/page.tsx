import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { RevenueOverTimeChart } from "@/components/admin/charts/revenue-over-time-chart";
import { PaymentStatusChart } from "@/components/admin/charts/payment-status-chart";
import { getOutstandingBalances, collectionRateFromRows, getRevenueByProgram } from "@/lib/finance/reports";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function FinanceReportsPage() {
  const [verifiedPayments, paymentStatusCounts, { rows: outstandingRows, totalOutstanding }, revenueByProgram] =
    await Promise.all([
      prisma.paymentRecord.findMany({
        where: { verificationStatus: "VERIFIED" },
        select: { amount: true, verifiedAt: true },
        orderBy: { verifiedAt: "asc" },
      }),
      prisma.paymentRecord.groupBy({ by: ["verificationStatus"], _count: { _all: true } }),
      getOutstandingBalances(),
      getRevenueByProgram(),
    ]);

  const totalRevenue = verifiedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const { rate: collectionRate } = collectionRateFromRows(outstandingRows);

  const byDay = new Map<string, number>();
  for (const payment of verifiedPayments) {
    if (!payment.verifiedAt) continue;
    const key = payment.verifiedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    byDay.set(key, (byDay.get(key) ?? 0) + Number(payment.amount));
  }
  const revenueOverTime = Array.from(byDay.entries()).map(([date, amount]) => ({ date, amount }));

  const paymentStatusData = paymentStatusCounts.map((row) => ({
    status: row.verificationStatus,
    count: row._count._all,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Payment revenue and verification activity.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total revenue collected</CardDescription>
            <CardTitle className="text-3xl">LKR {totalRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Collection rate</CardDescription>
            <CardTitle className="text-3xl">
              {collectionRate !== null ? `${Math.round(collectionRate)}%` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Outstanding balance</CardDescription>
            <CardTitle className="text-3xl">LKR {totalOutstanding.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue over time</CardTitle>
            <CardDescription>Verified payments</CardDescription>
          </CardHeader>
          {revenueOverTime.length > 0 ? (
            <RevenueOverTimeChart data={revenueOverTime} />
          ) : (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No verified payments yet.</p>
          )}
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Verification status</CardTitle>
            <CardDescription>All payment records</CardDescription>
          </CardHeader>
          {paymentStatusData.length > 0 ? (
            <PaymentStatusChart data={paymentStatusData} />
          ) : (
            <p className="px-6 pb-6 text-sm text-muted-foreground">No payments uploaded yet.</p>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue by program</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueByProgram.length === 0 ? (
            <p className="text-sm text-muted-foreground">No verified payments yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Program</TableHead>
                  <TableHead>Revenue (LKR)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {revenueByProgram.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
