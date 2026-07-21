import { LayoutDashboard, Inbox } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStaffLeaveNotifications } from "@/lib/notifications/staff-leave-feed";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

// Reuses the exact Cosmic Blues / Soft Whisper palette from the Program Coordinator and
// Finance dashboards (COORDINATOR_PALETTE, src/components/coordinator/palette.ts) rather than
// a Marketing-specific swatch — same per-icon coloring convention as every other layout.
const navItems: NavItem[] = [
  { href: "/marketing", label: "Dashboard", icon: <LayoutDashboard className="size-4 text-[#2B1FFF]" /> },
  { href: "/marketing/applications", label: "Applications", icon: <Inbox className="size-4 text-[#4356C4]" /> },
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
      contentBackgroundClassName="bg-gradient-to-b from-[#eef0fd] via-[#eceffa] to-white"
    >
      {children}
    </DashboardShell>
  );
}
