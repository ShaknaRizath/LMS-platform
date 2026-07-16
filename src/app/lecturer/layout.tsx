import { LayoutDashboard, BookOpen, Megaphone, CalendarDays, CalendarClock, Globe } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/lecturer", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/lecturer/modules", label: "My Modules", icon: <BookOpen className="size-4" /> },
  { href: "/lecturer/schedule", label: "Teaching Schedule", icon: <CalendarClock className="size-4" /> },
  { href: "/lecturer/announcements", label: "Announcements", icon: <Megaphone className="size-4" /> },
  { href: "/lecturer/forums", label: "Forums", icon: <Globe className="size-4" /> },
  { href: "/lecturer/calendar", label: "Calendar", icon: <CalendarDays className="size-4" /> },
];

export default async function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["LECTURER"]);

  return (
    <DashboardShell
      roleLabel="Lecturer"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Lecturer"}
      userEmail={user.email ?? ""}
      leaveHref="/staff/leave"
    >
      {children}
    </DashboardShell>
  );
}
