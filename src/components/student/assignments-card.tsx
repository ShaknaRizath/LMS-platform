import Link from "next/link";
import { FileText, ListChecks } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { STUDENT_PALETTE } from "@/components/student/palette";

export type TodoItem = {
  id: string;
  kind: "ASSIGNMENT" | "QUIZ";
  title: string;
  subtitle: string;
  moduleId: string;
  targetId: string;
};

export function AssignmentsCard({ items }: { items: TodoItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Assignments &amp; Exams</CardTitle>
      </CardHeader>
      <div className="flex flex-col gap-1 px-(--card-spacing) pb-(--card-spacing)">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing due right now.</p>
        ) : (
          items.map((item, index) => {
            const color = STUDENT_PALETTE[index % STUDENT_PALETTE.length];
            const Icon = item.kind === "QUIZ" ? ListChecks : FileText;
            const href =
              item.kind === "QUIZ"
                ? `/student/modules/${item.moduleId}/quizzes/${item.targetId}`
                : `/student/modules/${item.moduleId}#content-${item.targetId}`;
            return (
              <Link
                key={item.id}
                href={href}
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
