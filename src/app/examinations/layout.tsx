import { LayoutDashboard, ClipboardList, Award, Lock } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/examinations", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/examinations/exams", label: "Exams", icon: <ClipboardList className="size-4" /> },
  { href: "/examinations/marks", label: "Marks Locking", icon: <Lock className="size-4" /> },
  { href: "/examinations/certificates", label: "Certificates", icon: <Award className="size-4" /> },
];

export default async function ExaminationUnitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["EXAMINATION_UNIT"]);

  return (
    <DashboardShell
      roleLabel="Examination Unit"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Examination Unit"}
      userEmail={user.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
