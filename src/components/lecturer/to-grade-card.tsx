import Link from "next/link";
import { FileText, ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { LECTURER_PALETTE } from "@/components/lecturer/palette";

export type ToGradeItem = {
  id: string;
  kind: "SUBMISSION" | "ATTEMPT";
  title: string;
  subtitle: string;
  href: string;
};

export function ToGradeCard({ items }: { items: ToGradeItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>To Grade</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-1 px-(--card-spacing) pb-(--card-spacing)">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing waiting on you right now.</p>
        ) : (
          items.map((item, index) => {
            const color = LECTURER_PALETTE[index % LECTURER_PALETTE.length];
            const Icon = item.kind === "ATTEMPT" ? ListChecks : FileText;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color.bg }}
                >
                  <Icon className="size-4" style={{ color: color.fg }} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
