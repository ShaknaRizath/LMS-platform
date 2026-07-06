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
} from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/admin/programs", label: "Programs", icon: <GraduationCap className="size-4" /> },
  { href: "/admin/academic-years", label: "Academic Years", icon: <CalendarRange className="size-4" /> },
  { href: "/admin/modules", label: "Modules", icon: <BookOpen className="size-4" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="size-4" /> },
  { href: "/admin/registrations", label: "Registrations", icon: <ClipboardCheck className="size-4" /> },
  { href: "/admin/announcements", label: "Announcements", icon: <Megaphone className="size-4" /> },
  { href: "/admin/calendar", label: "Calendar", icon: <CalendarDays className="size-4" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="size-4" /> },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["SUPER_ADMIN", "ADMIN"]);

  return (
    <DashboardShell
      roleLabel="Administrator"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Admin"}
      userEmail={user.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
