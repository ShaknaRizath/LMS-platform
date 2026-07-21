import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { COORDINATOR_PALETTE } from "@/components/coordinator/palette";

export type ProgramInterestRow = {
  programId: string;
  programName: string;
  count: number;
};

export function ProgramInterestCard({ rows }: { rows: ProgramInterestRow[] }) {
  const maxCount = Math.max(1, ...rows.map((row) => row.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Program Interest Summary</CardTitle>
        <CardDescription>Applications received per program, all time</CardDescription>
      </CardHeader>
      <div className="flex flex-col gap-3 px-(--card-spacing) pb-(--card-spacing)">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No applications yet.</p>
        ) : (
          rows.map((row, index) => {
            const color = COORDINATOR_PALETTE[index % COORDINATOR_PALETTE.length];
            return (
              <div key={row.programId} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium text-foreground">{row.programName}</span>
                  <span className="shrink-0 text-muted-foreground">{row.count}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${(row.count / maxCount) * 100}%`, backgroundColor: color.accent }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
