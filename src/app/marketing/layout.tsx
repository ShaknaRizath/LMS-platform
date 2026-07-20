import { LayoutDashboard, Inbox } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStaffLeaveNotifications } from "@/lib/notifications/staff-leave-feed";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/marketing", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/marketing/applications", label: "Applications", icon: <Inbox className="size-4" /> },
];

export default async function MarketingOfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["MARKETING_OFFICER"]);

  const [notificationItems, readRows] = await Promise.all([
    getStaffLeaveNotifications(user.id),
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
      roleLabel="Marketing Officer"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Marketing Officer"}
      userEmail={user.email ?? ""}
      leaveHref="/staff/leave"
      profileHref="/marketing/profile"
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
