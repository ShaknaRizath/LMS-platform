import { LayoutDashboard, BarChart3, ShieldAlert, GraduationCap, CalendarDays } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStaffLeaveNotifications } from "@/lib/notifications/staff-leave-feed";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

// 5 nav icons, each a distinct color — blends the vivid pink/magenta/coral/orange palette
// (ACADEMIC_PALETTE, used on the dashboard cards) with the darker "Vintage Rose" swatch, since
// a single 4-color palette can't give 5 icons 5 non-repeating colors.
const navItems: NavItem[] = [
  { href: "/academic", label: "Dashboard", icon: <LayoutDashboard className="size-4 text-[#FF6FD3]" /> },
  { href: "/academic/discipline", label: "Discipline Cases", icon: <ShieldAlert className="size-4 text-[#5F2A3C]" /> },
  { href: "/academic/workload", label: "Lecturer Workload", icon: <GraduationCap className="size-4 text-[#EF7C4B]" /> },
  { href: "/academic/analytics", label: "Analytics", icon: <BarChart3 className="size-4 text-[#8C4A5C]" /> },
  { href: "/academic/calendar", label: "Calendar", icon: <CalendarDays className="size-4 text-[#FF8FA3]" /> },
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
      contentBackgroundClassName="bg-gradient-to-b from-[#fdeef1] via-[#f8eaed] to-white"
    >
      {children}
    </DashboardShell>
  );
}
