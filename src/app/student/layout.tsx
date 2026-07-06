import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileCheck2,
  Megaphone,
  CalendarDays,
} from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/student/catalog", label: "Catalog", icon: <BookOpen className="size-4" /> },
  { href: "/student/register", label: "Register", icon: <ClipboardList className="size-4" /> },
  { href: "/student/registrations", label: "My Registrations", icon: <FileCheck2 className="size-4" /> },
  { href: "/student/announcements", label: "Announcements", icon: <Megaphone className="size-4" /> },
  { href: "/student/calendar", label: "Calendar", icon: <CalendarDays className="size-4" /> },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["STUDENT"]);

  return (
    <DashboardShell
      roleLabel="Student"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Student"}
      userEmail={user.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
