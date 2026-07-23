import {
  LayoutDashboard,
  GraduationCap,
  CalendarRange,
  BookOpen,
  Users,
  ClipboardCheck,
  Megaphone,
  CalendarDays,
  Settings,
  Bell,
  BarChart3,
  Inbox,
} from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getAdminNotifications } from "@/lib/notifications/admin-feed";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="size-4 text-[#6D7DBB]" /> },
  { href: "/admin/analytics", label: "Analytics", icon: <BarChart3 className="size-4 text-[#C79966]" /> },
  { href: "/admin/programs", label: "Programs", icon: <GraduationCap className="size-4 text-[#8A6339]" /> },
  { href: "/admin/academic-years", label: "Academic Years", icon: <CalendarRange className="size-4 text-[#2B3252]" /> },
  { href: "/admin/modules", label: "Modules", icon: <BookOpen className="size-4 text-[#E0B37E]" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="size-4 text-[#6D7DBB]" /> },
  { href: "/admin/applications", label: "Applications", icon: <Inbox className="size-4 text-[#C79966]" /> },
  { href: "/admin/registrations", label: "Registrations", icon: <ClipboardCheck className="size-4 text-[#8A6339]" /> },
  { href: "/admin/announcements", label: "Announcements", icon: <Megaphone className="size-4 text-[#2B3252]" /> },
  { href: "/admin/notifications", label: "Notifications", icon: <Bell className="size-4 text-[#E0B37E]" /> },
  { href: "/admin/calendar", label: "Calendar", icon: <CalendarDays className="size-4 text-[#6D7DBB]" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="size-4 text-[#C79966]" /> },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["SUPER_ADMIN", "CAMPUS_ADMIN"]);

  const [notificationItems, readRows] = await Promise.all([
    getAdminNotifications(user.id),
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
      roleLabel={user.role === "SUPER_ADMIN" ? "Super Administrator" : "Campus Administrator"}
      navItems={navItems}
      userName={user.name ?? user.email ?? "Admin"}
      userEmail={user.email ?? ""}
      leaveHref="/staff/leave"
      profileHref="/admin/profile"
      notifications={notifications}
      contentBackgroundClassName="bg-gradient-to-b from-[#eef1f8] via-[#f5f0e8] to-white"
    >
      {children}
    </DashboardShell>
  );
}
