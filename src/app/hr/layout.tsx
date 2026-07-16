import { LayoutDashboard, Users, CalendarClock } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
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

  return (
    <DashboardShell
      roleLabel="HR Officer"
      navItems={navItems}
      userName={user.name ?? user.email ?? "HR Officer"}
      userEmail={user.email ?? ""}
      leaveHref="/staff/leave"
    >
      {children}
    </DashboardShell>
  );
}
