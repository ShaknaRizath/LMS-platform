import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { STUDENT_PALETTE } from "@/components/student/palette";

type PaletteColor = { bg: string; fg: string; accent: string };

export function ProgressCard({
  title = "Progress",
  label = "Assignments submitted",
  submitted,
  total,
  emptyLabel = "No assignments yet",
  palette = STUDENT_PALETTE,
}: {
  title?: string;
  label?: string;
  submitted: number;
  total: number;
  emptyLabel?: string;
  palette?: readonly PaletteColor[];
}) {
  const percent = total > 0 ? Math.round((submitted / total) * 100) : 0;
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percent / 100);
  const ring = palette[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <div className="flex flex-col items-center gap-3 px-(--card-spacing) pb-(--card-spacing)">
        <div className="relative flex size-[120px] items-center justify-center">
          <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
            <circle cx="60" cy="60" r={radius} fill="none" stroke={ring.bg} strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={ring.accent}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <span className="absolute text-3xl font-semibold text-foreground">{percent}%</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">
            {total > 0 ? `${submitted} of ${total} submitted` : emptyLabel}
          </p>
        </div>
      </div>
    </Card>
  );
}
