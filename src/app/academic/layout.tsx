import { LayoutDashboard } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/academic", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
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
    >
      {children}
    </DashboardShell>
  );
}
