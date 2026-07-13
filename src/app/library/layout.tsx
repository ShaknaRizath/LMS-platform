import { LayoutDashboard } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/library", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
];

export default async function LibraryOfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["LIBRARY_OFFICER"]);

  return (
    <DashboardShell
      roleLabel="Library Officer"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Library Officer"}
      userEmail={user.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
