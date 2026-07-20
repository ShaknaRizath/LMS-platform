import { Award, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { STUDENT_PALETTE } from "@/components/student/palette";

type PaletteColor = { bg: string; fg: string; accent: string };

export type ActivityItem = {
  id: string;
  label: string;
  detail: string;
  date: Date;
  kind: "content" | "grade";
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ActivityCard({
  userName,
  avatarUrl,
  activity,
  palette = STUDENT_PALETTE,
  className,
}: {
  userName: string;
  avatarUrl?: string | null;
  activity: ActivityItem[];
  palette?: readonly PaletteColor[];
  className?: string;
}) {
  const avatarColor = palette[1] ?? palette[0];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <div className="flex flex-col items-center gap-1 px-(--card-spacing) pb-2">
        <Avatar size="lg">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={userName} />}
          <AvatarFallback style={{ backgroundColor: avatarColor.bg, color: avatarColor.fg }} className="text-base font-semibold">
            {initials(userName)}
          </AvatarFallback>
        </Avatar>
        <p className="mt-2 font-medium text-foreground">{userName}</p>
      </div>
      <div className="flex flex-col gap-1 px-(--card-spacing) pb-(--card-spacing)">
        <p className="mb-1 text-xs font-medium text-muted-foreground">Recent activity</p>
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing new yet.</p>
        ) : (
          activity.map((item, index) => {
            const color = palette[index % palette.length];
            const Icon = item.kind === "grade" ? Award : FileText;
            return (
              <div key={item.id} className="flex items-start gap-3 rounded-lg p-2">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color.bg }}
                >
                  <Icon className="size-3.5" style={{ color: color.fg }} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{item.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
