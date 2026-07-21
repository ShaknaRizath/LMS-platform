import { LayoutDashboard, BarChart3, CalendarClock, Users, GraduationCap } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getCoordinatorNotifications } from "@/lib/notifications/coordinator-feed";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

// 5 nav icons, each a distinct color drawn from the Cosmic Blues / Soft Whisper reference
// swatches (COORDINATOR_PALETTE, used on the dashboard cards) — the same per-role,
// per-icon coloring convention as every other layout (see e.g. src/app/student/layout.tsx).
const navItems: NavItem[] = [
  { href: "/coordinator", label: "Dashboard", icon: <LayoutDashboard className="size-4 text-[#2B1EFF]" /> },
  { href: "/coordinator/timetables", label: "Timetables", icon: <CalendarClock className="size-4 text-[#4356C4]" /> },
  { href: "/coordinator/students", label: "Students", icon: <Users className="size-4 text-[#8FA6E3]" /> },
  { href: "/coordinator/workload", label: "Workload", icon: <GraduationCap className="size-4 text-[#140F91]" /> },
  { href: "/coordinator/analytics", label: "Analytics", icon: <BarChart3 className="size-4 text-[#5D6685]" /> },
];

export default async function ProgramCoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["PROGRAM_COORDINATOR"]);

  const [notificationItems, readRows] = await Promise.all([
    getCoordinatorNotifications(user.id),
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
      roleLabel="Program Coordinator"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Program Coordinator"}
      userEmail={user.email ?? ""}
      leaveHref="/staff/leave"
      profileHref="/coordinator/profile"
      notifications={notifications}
      contentBackgroundClassName="bg-gradient-to-b from-[#eef0fd] via-[#eceffa] to-white"
    >
      {children}
    </DashboardShell>
  );
}
