import { Card } from "@/components/ui/card";
import { STUDENT_PALETTE } from "@/components/student/palette";

type PaletteColor = { bg: string; fg: string; accent: string };

export function DashboardHeaderCard({
  title,
  subtitle,
  stats,
  palette = STUDENT_PALETTE,
  className = "bg-gradient-to-br from-[#f2fbfd] via-[#eefaf6] to-[#eefbf2]",
}: {
  title: string;
  subtitle: string;
  stats: { label: string; value: React.ReactNode }[];
  palette?: readonly PaletteColor[];
  className?: string;
}) {
  return (
    <Card className={`border-none p-0 ${className}`}>
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {stats.map((stat, index) => {
            const color = palette[index % palette.length];
            return (
              <div
                key={stat.label}
                className="min-w-36 rounded-xl px-4 py-3 shadow-[0_6px_16px_-10px_rgba(0,0,0,0.25)]"
                style={{ backgroundColor: color.bg }}
              >
                <p className="text-xs font-medium" style={{ color: color.fg }}>
                  {stat.label}
                </p>
                <div className="mt-1 text-base font-semibold" style={{ color: color.fg }}>
                  {stat.value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
