import Link from "next/link";
import { BarChart3, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";

export function OpenReportsCard() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: COORDINATOR_PALETTE[2].bg }}
          >
            <BarChart3 className="size-4" style={{ color: COORDINATOR_PALETTE[2].fg }} />
          </div>
          <div>
            <CardTitle>Open Reports</CardTitle>
            <CardDescription>Full revenue &amp; collection breakdown</CardDescription>
          </div>
        </div>
      </CardHeader>
      <div className="px-(--card-spacing) pb-(--card-spacing)">
        <Button nativeButton={false} render={<Link href="/finance/reports" />} variant="outline" className="w-full">
          View Reports
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </Card>
  );
}
