import { Card } from "@/components/ui/card";

const STAT_COLORS = [
  { bg: "#DDF3FB", fg: "#1B7A93" },
  { bg: "#D6EFEC", fg: "#22796E" },
  { bg: "#DFF6E4", fg: "#2B8A4C" },
];

export function DashboardHeaderCard({
  title,
  subtitle,
  stats,
}: {
  title: string;
  subtitle: string;
  stats: { label: string; value: React.ReactNode }[];
}) {
  return (
    <Card className="border-none bg-gradient-to-br from-[#f2fbfd] via-[#eefaf6] to-[#eefbf2] p-0">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {stats.map((stat, index) => {
            const color = STAT_COLORS[index % STAT_COLORS.length];
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
