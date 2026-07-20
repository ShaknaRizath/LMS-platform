import { LayoutDashboard, BarChart3, ShieldAlert } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStaffLeaveNotifications } from "@/lib/notifications/staff-leave-feed";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/academic", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/academic/discipline", label: "Discipline Cases", icon: <ShieldAlert className="size-4" /> },
  { href: "/academic/analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
];

export default async function AcademicDirectorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["ACADEMIC_DIRECTOR"]);

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
      roleLabel="Academic Director"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Academic Director"}
      userEmail={user.email ?? ""}
      leaveHref="/staff/leave"
      profileHref="/academic/profile"
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
