import { LayoutDashboard, BarChart3, CalendarClock, Users, GraduationCap } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/coordinator", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/coordinator/timetables", label: "Timetables", icon: <CalendarClock className="size-4" /> },
  { href: "/coordinator/students", label: "Students", icon: <Users className="size-4" /> },
  { href: "/coordinator/workload", label: "Workload", icon: <GraduationCap className="size-4" /> },
  { href: "/coordinator/analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
];

export default async function ProgramCoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["PROGRAM_COORDINATOR"]);

  return (
    <DashboardShell
      roleLabel="Program Coordinator"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Program Coordinator"}
      userEmail={user.email ?? ""}
      leaveHref="/staff/leave"
    >
      {children}
    </DashboardShell>
  );
}
