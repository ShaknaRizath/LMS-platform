import Link from "next/link";
import { ChevronRight, HandCoins } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";

export type ScholarshipPreviewItem = {
  id: string;
  studentName: string;
  programName: string | null;
  reason: string;
};

export function ScholarshipPreviewCard({ items }: { items: ScholarshipPreviewItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Scholarship Applications</CardTitle>
          <Link
            href="/finance/scholarships"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View All <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-1 px-(--card-spacing) pb-(--card-spacing)">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing pending.</p>
        ) : (
          items.map((item, index) => {
            const color = COORDINATOR_PALETTE[index % COORDINATOR_PALETTE.length];
            return (
              <Link
                key={item.id}
                href="/finance/scholarships"
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color.bg }}
                >
                  <HandCoins className="size-4" style={{ color: color.fg }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.studentName}
                    {item.programName ? ` — ${item.programName}` : ""}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{item.reason}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
