import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RevenueOverTimeChart } from "@/components/admin/charts/revenue-over-time-chart";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";

export function RevenueOverviewCard({
  data,
  totalRevenue,
}: {
  data: { date: string; amount: number }[];
  totalRevenue: number;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Verified payments, last 30 days</CardDescription>
          </div>
          <Link
            href="/finance/reports"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Full Reports <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-2 px-(--card-spacing) pb-(--card-spacing)">
        <p className="text-2xl font-semibold text-foreground">LKR {totalRevenue.toLocaleString()}</p>
        {data.length > 0 ? (
          <RevenueOverTimeChart data={data} color={COORDINATOR_PALETTE[0].accent} />
        ) : (
          <p className="text-sm text-muted-foreground">No verified payments in this window yet.</p>
        )}
      </div>
    </Card>
  );
}
