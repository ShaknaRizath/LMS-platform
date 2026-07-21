import Link from "next/link";
import { ChevronRight, GraduationCap } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ACADEMIC_PALETTE } from "@/components/academic/palette";
import type { LecturerWorkloadRow } from "@/lib/workload";

export function LecturerWorkloadCard({ rows }: { rows: LecturerWorkloadRow[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lecturer Workload</CardTitle>
          <Link
            href="/academic/workload"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View All <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-1 px-(--card-spacing) pb-(--card-spacing)">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active lecturers yet.</p>
        ) : (
          rows.map((row, index) => {
            const color = ACADEMIC_PALETTE[index % ACADEMIC_PALETTE.length];
            return (
              <Link
                key={row.lecturerId}
                href="/academic/workload"
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color.bg }}
                >
                  <GraduationCap className="size-4" style={{ color: color.fg }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{row.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.moduleCount} modules &middot; {row.weeklyHours.toFixed(1)}h/week
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
