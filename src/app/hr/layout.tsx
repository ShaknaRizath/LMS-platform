import { LayoutDashboard, Users, CalendarClock } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getHrNotifications } from "@/lib/notifications/hr-feed";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/hr", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/hr/staff", label: "Staff Directory", icon: <Users className="size-4" /> },
  { href: "/hr/leave", label: "Leave Requests", icon: <CalendarClock className="size-4" /> },
];

export default async function HrOfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["HR_OFFICER"]);

  const [notificationItems, readRows] = await Promise.all([
    getHrNotifications(),
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
      roleLabel="HR Officer"
      navItems={navItems}
      userName={user.name ?? user.email ?? "HR Officer"}
      userEmail={user.email ?? ""}
      leaveHref="/staff/leave"
      profileHref="/hr/profile"
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
