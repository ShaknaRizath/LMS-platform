import Link from "next/link";
import { ChevronRight, Lock, LockOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";
import type { MarksLockingSummary } from "@/lib/examinations/dashboard";

export function MarksLockingStatusCard({ summary }: { summary: MarksLockingSummary }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Marks Locking Status</CardTitle>
            <CardDescription>{summary.totalActive} active modules</CardDescription>
          </div>
          <Link
            href="/examinations/marks"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Manage <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-3 px-(--card-spacing) pb-(--card-spacing)">
        <div className="flex gap-3">
          <div className="flex-1 rounded-lg p-3" style={{ backgroundColor: COORDINATOR_PALETTE[0].bg }}>
            <p className="text-xs font-medium" style={{ color: COORDINATOR_PALETTE[0].fg }}>
              Locked
            </p>
            <p className="text-xl font-semibold" style={{ color: COORDINATOR_PALETTE[0].fg }}>
              {summary.lockedCount}
            </p>
          </div>
          <div className="flex-1 rounded-lg p-3" style={{ backgroundColor: COORDINATOR_PALETTE[1].bg }}>
            <p className="text-xs font-medium" style={{ color: COORDINATOR_PALETTE[1].fg }}>
              Open
            </p>
            <p className="text-xl font-semibold" style={{ color: COORDINATOR_PALETTE[1].fg }}>
              {summary.openCount}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {summary.recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No locking activity yet.</p>
          ) : (
            summary.recent.map((row, index) => {
              const Icon = row.locked ? Lock : LockOpen;
              const color = COORDINATOR_PALETTE[index % COORDINATOR_PALETTE.length];
              return (
                <div key={`${row.moduleId}-${row.date.getTime()}`} className="flex items-center gap-2 rounded-lg p-1">
                  <div
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: color.bg }}
                  >
                    <Icon className="size-3.5" style={{ color: color.fg }} />
                  </div>
                  <p className="min-w-0 flex-1 truncate text-xs text-foreground">
                    {row.moduleCode} — {row.moduleTitle}{" "}
                    <span className="text-muted-foreground">{row.locked ? "locked" : "unlocked"} by {row.actorName}</span>
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Card>
  );
}
