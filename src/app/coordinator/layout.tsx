import { LayoutDashboard } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/coordinator", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
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
    >
      {children}
    </DashboardShell>
  );
}
