import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LeaveSummaryChart } from "@/components/hr/leave-summary-chart";

export function LeaveSummaryCard({ data }: { data: { status: string; count: number }[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Summary</CardTitle>
        <CardDescription>All leave requests, by status</CardDescription>
      </CardHeader>
      <div className="px-(--card-spacing) pb-(--card-spacing)">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leave requests yet.</p>
        ) : (
          <LeaveSummaryChart data={data} />
        )}
      </div>
    </Card>
  );
}
