import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";

export type AnalyticsPreviewStat = {
  label: string;
  value: string;
};

export function AnalyticsPreviewCard({
  stats,
  topAbsenteeModule,
}: {
  stats: AnalyticsPreviewStat[];
  topAbsenteeModule: string | null;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Analytics Preview</CardTitle>
            <CardDescription>Last 30 days, across all active modules</CardDescription>
          </div>
          <Link
            href="/coordinator/analytics"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Full Analytics <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-4 px-(--card-spacing) pb-(--card-spacing)">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat, index) => {
            const color = COORDINATOR_PALETTE[index % COORDINATOR_PALETTE.length];
            return (
              <div key={stat.label} className="rounded-lg p-3" style={{ backgroundColor: color.bg }}>
                <p className="text-xs" style={{ color: color.fg }}>
                  {stat.label}
                </p>
                <p className="mt-1 text-xl font-semibold" style={{ color: color.fg }}>
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Module with most absences:{" "}
          <span className="font-medium text-foreground">{topAbsenteeModule ?? "—"}</span>
        </p>
      </div>
    </Card>
  );
}
