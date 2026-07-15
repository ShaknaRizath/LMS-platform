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
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/admin/analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
  { href: "/admin/programs", label: "Programs", icon: <GraduationCap className="size-4" /> },
  { href: "/admin/academic-years", label: "Academic Years", icon: <CalendarRange className="size-4" /> },
  { href: "/admin/modules", label: "Modules", icon: <BookOpen className="size-4" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="size-4" /> },
  { href: "/admin/applications", label: "Applications", icon: <Inbox className="size-4" /> },
  { href: "/admin/registrations", label: "Registrations", icon: <ClipboardCheck className="size-4" /> },
  { href: "/admin/announcements", label: "Announcements", icon: <Megaphone className="size-4" /> },
  { href: "/admin/notifications", label: "Notifications", icon: <Bell className="size-4" /> },
  { href: "/admin/calendar", label: "Calendar", icon: <CalendarDays className="size-4" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="size-4" /> },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["SUPER_ADMIN", "CAMPUS_ADMIN"]);

  return (
    <DashboardShell
      roleLabel={user.role === "SUPER_ADMIN" ? "Super Administrator" : "Campus Administrator"}
      navItems={navItems}
      userName={user.name ?? user.email ?? "Admin"}
      userEmail={user.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
