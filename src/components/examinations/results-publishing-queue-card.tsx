import Link from "next/link";
import { ChevronRight, FileCheck2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";
import type { ResultsQueueRow } from "@/lib/examinations/dashboard";

export function ResultsPublishingQueueCard({ rows }: { rows: ResultsQueueRow[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Results Publishing Queue</CardTitle>
            <CardDescription>Exams awaiting result review</CardDescription>
          </div>
          <Link
            href="/examinations/exams"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View All <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-1 px-(--card-spacing) pb-(--card-spacing)">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing awaiting publishing.</p>
        ) : (
          rows.map((row, index) => {
            const color = COORDINATOR_PALETTE[index % COORDINATOR_PALETTE.length];
            return (
              <Link
                key={row.quizId}
                href={`/examinations/exams/${row.quizId}/results`}
                className="flex items-start justify-between gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: color.bg }}
                  >
                    <FileCheck2 className="size-4" style={{ color: color.fg }} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{row.title}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.moduleCode} · {row.publishedCount} published / {row.totalStudents} students
                    </p>
                    {row.notAttemptedCount > 0 && (
                      <p className="truncate text-xs text-muted-foreground">{row.notAttemptedCount} not attempted</p>
                    )}
                  </div>
                </div>
                {row.pendingReviewCount > 0 && (
                  <Badge variant="default" className="shrink-0">
                    Results pending review
                  </Badge>
                )}
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
