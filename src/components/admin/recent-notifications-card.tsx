import Link from "next/link";
import { ChevronRight, Mail, MessageSquare, MessageCircle } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN_PALETTE } from "@/components/admin/palette";
import type { NotificationChannel } from "@/generated/prisma/enums";

export type RecentNotificationItem = {
  id: string;
  type: string;
  channel: NotificationChannel;
  recipient: string;
  status: string;
  sentAt: Date;
};

const CHANNEL_ICON: Record<NotificationChannel, typeof Mail> = {
  EMAIL: Mail,
  SMS: MessageSquare,
  WHATSAPP: MessageCircle,
};

export function RecentNotificationsCard({ items }: { items: RecentNotificationItem[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Notifications</CardTitle>
          <Link
            href="/admin/notifications"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View All <ChevronRight className="size-3.5" />
          </Link>
        </div>
      </CardHeader>
      <div className="flex flex-col gap-1 px-(--card-spacing) pb-(--card-spacing)">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing sent yet.</p>
        ) : (
          items.map((item, index) => {
            const color = ADMIN_PALETTE[index % ADMIN_PALETTE.length];
            const Icon = CHANNEL_ICON[item.channel];
            return (
              <Link
                key={item.id}
                href="/admin/notifications"
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
              >
                <div
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: color.bg }}
                >
                  <Icon className="size-4" style={{ color: color.fg }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {item.type.replaceAll("_", " ")}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.recipient} &middot; {item.status}
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
