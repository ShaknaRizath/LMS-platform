import { LayoutDashboard, BookOpen, Megaphone, CalendarDays, CalendarClock, Globe } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getLecturerNotifications } from "@/lib/notifications/lecturer-feed";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/lecturer", label: "Dashboard", icon: <LayoutDashboard className="size-4 text-[#8B5FBF]" /> },
  { href: "/lecturer/modules", label: "My Modules", icon: <BookOpen className="size-4 text-[#C97FB4]" /> },
  { href: "/lecturer/schedule", label: "Teaching Schedule", icon: <CalendarClock className="size-4 text-[#F0B36B]" /> },
  { href: "/lecturer/announcements", label: "Announcements", icon: <Megaphone className="size-4 text-[#7376C0]" /> },
  { href: "/lecturer/forums", label: "Forums", icon: <Globe className="size-4 text-[#B98FE0]" /> },
  { href: "/lecturer/calendar", label: "Calendar", icon: <CalendarDays className="size-4 text-[#D3AACB]" /> },
];

export default async function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["LECTURER"]);

  const [notificationItems, readRows] = await Promise.all([
    getLecturerNotifications(user.id),
    prisma.notificationRead.findMany({ where: { userId: user.id }, select: { key: true } }),
  ]);
  const readKeys = new Set(readRows.map((row) => row.key));
  const notifications = notificationItems.map((item) => ({
    id: item.id,
    title: item.title,
    detail: item.detail,
    href: item.href,
    date: item.date.toISOString(),
    unread: !readKeys.has(item.id),
  }));

  return (
    <DashboardShell
      roleLabel="Lecturer"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Lecturer"}
      userEmail={user.email ?? ""}
      leaveHref="/staff/leave"
      profileHref="/lecturer/profile"
      notifications={notifications}
      contentBackgroundClassName="bg-gradient-to-b from-[#f4effa] via-[#faf3f8] to-white"
    >
      {children}
    </DashboardShell>
  );
}
