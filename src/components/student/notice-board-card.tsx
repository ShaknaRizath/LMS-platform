import Link from "next/link";
import { ChevronRight, Megaphone } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { STUDENT_PALETTE } from "@/components/student/palette";

export type NoticeSummary = {
  id: string;
  title: string;
  publishedAt: Date;
  moduleCode: string | null;
};

export function NoticeBoardCard({ notices }: { notices: NoticeSummary[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Notice Board</CardTitle>
          <Link
            href="/student/announcements"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View All <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-1 px-(--card-spacing) pb-(--card-spacing)">
        {notices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        ) : (
          notices.map((notice, index) => {
            const color = STUDENT_PALETTE[index % STUDENT_PALETTE.length];
            return (
              <Link
                key={notice.id}
                href="/student/announcements"
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color.bg }}
                >
                  <Megaphone className="size-3.5" style={{ color: color.fg }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{notice.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {notice.moduleCode ?? "Institution"} &middot;{" "}
                    {notice.publishedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
