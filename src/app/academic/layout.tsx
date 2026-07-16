import { LayoutDashboard, BarChart3, ShieldAlert } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
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

  return (
    <DashboardShell
      roleLabel="Academic Director"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Academic Director"}
      userEmail={user.email ?? ""}
      leaveHref="/staff/leave"
    >
      {children}
    </DashboardShell>
  );
}
