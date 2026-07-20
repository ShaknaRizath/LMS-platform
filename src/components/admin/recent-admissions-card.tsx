import Link from "next/link";
import { ChevronRight, UserCheck, UserX } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_PALETTE } from "@/components/admin/palette";

export type RecentAdmissionItem = {
  id: string;
  applicantName: string;
  programName: string;
  status: "APPROVED" | "REJECTED";
  reviewedAt: Date;
};

export function RecentAdmissionsCard({ items }: { items: RecentAdmissionItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Admissions</CardTitle>
          <Link
            href="/admin/applications"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View All <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-1 px-(--card-spacing) pb-(--card-spacing)">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No admissions decisions yet.</p>
        ) : (
          items.map((item, index) => {
            const color = ADMIN_PALETTE[index % ADMIN_PALETTE.length];
            const Icon = item.status === "APPROVED" ? UserCheck : UserX;
            return (
              <Link
                key={item.id}
                href="/admin/applications"
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color.bg }}
                >
                  <Icon className="size-4" style={{ color: color.fg }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.applicantName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.programName} &middot; {item.status === "APPROVED" ? "Approved" : "Rejected"}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </Card>
  );
}
