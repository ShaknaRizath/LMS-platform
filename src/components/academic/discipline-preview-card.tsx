import Link from "next/link";
import { ChevronRight, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ACADEMIC_PALETTE } from "@/components/academic/palette";

export type DisciplinePreviewItem = {
  id: string;
  studentName: string;
  reportedByName: string;
  incidentDate: Date;
};

export function DisciplineCasePreview({ items }: { items: DisciplinePreviewItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Discipline Cases</CardTitle>
          <Link
            href="/academic/discipline"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View All <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-1 px-(--card-spacing) pb-(--card-spacing)">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open discipline cases.</p>
        ) : (
          items.map((item, index) => {
            const color = ACADEMIC_PALETTE[index % ACADEMIC_PALETTE.length];
            return (
              <Link
                key={item.id}
                href="/academic/discipline"
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color.bg }}
                >
                  <ShieldAlert className="size-4" style={{ color: color.fg }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.studentName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    Reported by {item.reportedByName} &middot; {item.incidentDate.toLocaleDateString()}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
