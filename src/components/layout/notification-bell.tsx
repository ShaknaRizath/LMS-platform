"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { markNotificationRead } from "@/lib/actions/student/notification.actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  date: string;
  href: string;
  unread: boolean;
};

function timeAgo(date: Date) {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function NotificationBell({ items }: { items: NotificationItem[] }) {
  const [localItems, setLocalItems] = useState(items);
  const [, startTransition] = useTransition();
  const unreadCount = localItems.filter((item) => item.unread).length;

  function openItem(id: string) {
    setLocalItems((prev) => prev.map((item) => (item.id === id ? { ...item, unread: false } : item)));
    startTransition(() => markNotificationRead(id));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button type="button" variant="ghost" size="icon" className="relative">
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <p className="px-2 py-1.5 text-sm font-medium">Notifications</p>
        {localItems.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">Nothing new right now.</p>
        ) : (
          localItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              render={<Link href={item.href} onClick={() => item.unread && openItem(item.id)} />}
              className="flex-col items-start gap-0.5"
            >
              <div className="flex w-full items-center gap-2">
                {item.unread && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                <p className="truncate text-sm font-medium">{item.title}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {item.detail} · {timeAgo(new Date(item.date))}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
