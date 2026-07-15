import { LayoutDashboard, ClipboardCheck, BarChart3, GraduationCap } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/finance", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/finance/registrations", label: "Registrations", icon: <ClipboardCheck className="size-4" /> },
  { href: "/finance/programs", label: "Programs & Fees", icon: <GraduationCap className="size-4" /> },
  { href: "/finance/reports", label: "Reports", icon: <BarChart3 className="size-4" /> },
];

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["FINANCE"]);

  return (
    <DashboardShell
      roleLabel="Finance Staff"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Finance"}
      userEmail={user.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
