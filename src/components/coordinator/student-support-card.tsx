import Link from "next/link";
import { ChevronRight, ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";
import type { DisciplineSupportSummary } from "@/lib/student-support";

export function StudentSupportCard({ summary }: { summary: DisciplineSupportSummary }) {
  const { totalStudents, studentsWithCases, studentsNeedingAttention, recentCases } = summary;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Student Support</CardTitle>
          <Link
            href="/coordinator/students"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View All <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-4 px-(--card-spacing) pb-(--card-spacing)">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg p-2" style={{ backgroundColor: COORDINATOR_PALETTE[0].bg }}>
            <p className="text-xs" style={{ color: COORDINATOR_PALETTE[0].fg }}>
              Total students
            </p>
            <p className="text-lg font-semibold" style={{ color: COORDINATOR_PALETTE[0].fg }}>
              {totalStudents}
            </p>
          </div>
          <div className="rounded-lg p-2" style={{ backgroundColor: COORDINATOR_PALETTE[2].bg }}>
            <p className="text-xs" style={{ color: COORDINATOR_PALETTE[2].fg }}>
              With discipline cases
            </p>
            <p className="text-lg font-semibold" style={{ color: COORDINATOR_PALETTE[2].fg }}>
              {studentsWithCases}
            </p>
          </div>
        </div>

        {studentsNeedingAttention === 0 ? (
          <div className="flex items-start gap-3 rounded-lg border border-border p-3">
            <ShieldCheck className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">No open discipline cases</p>
              <p className="text-xs text-muted-foreground">
                All student discipline records are currently clear.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                {studentsNeedingAttention} student{studentsNeedingAttention === 1 ? "" : "s"} needing attention
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground">Recently filed</p>
              {recentCases.map((disciplineCase) => (
                <Link
                  key={disciplineCase.id}
                  href={`/coordinator/students/${disciplineCase.studentId}`}
                  className="flex items-center justify-between gap-2 rounded-lg p-1 text-left text-sm transition-colors hover:bg-muted/60"
                >
                  <span className="truncate font-medium text-foreground">{disciplineCase.studentName}</span>
                  <Badge variant={disciplineCase.status === "OPEN" ? "outline" : "secondary"} className="shrink-0">
                    {disciplineCase.incidentDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
