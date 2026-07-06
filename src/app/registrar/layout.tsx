import { LayoutDashboard } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/registrar", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
];

export default async function RegistrarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["REGISTRAR"]);

  return (
    <DashboardShell
      roleLabel="Registrar"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Registrar"}
      userEmail={user.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
