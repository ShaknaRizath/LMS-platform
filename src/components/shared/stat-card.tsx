import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function StatCard({
  label,
  value,
  hint,
  comingSoon = false,
}: {
  label: string;
  value?: number | string;
  hint?: string;
  comingSoon?: boolean;
}) {
  return (
    <Card className={comingSoon ? "opacity-70" : undefined}>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardDescription>{label}</CardDescription>
          {comingSoon && (
            <Badge variant="outline" className="shrink-0">
              Coming soon
            </Badge>
          )}
        </div>
        <CardTitle className="text-3xl">{comingSoon ? "—" : value}</CardTitle>
        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardHeader>
    </Card>
  );
}
