import { LayoutDashboard, Inbox } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/marketing", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/marketing/applications", label: "Applications", icon: <Inbox className="size-4" /> },
];

export default async function MarketingOfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["MARKETING_OFFICER"]);

  return (
    <DashboardShell
      roleLabel="Marketing Officer"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Marketing Officer"}
      userEmail={user.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
