import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileCheck2,
  Megaphone,
  CalendarDays,
  Wallet,
} from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: <LayoutDashboard className="size-4 text-[#5EC3E0]" /> },
  { href: "/student/catalog", label: "Catalog", icon: <BookOpen className="size-4 text-[#4FB8B0]" /> },
  { href: "/student/register", label: "Register", icon: <ClipboardList className="size-4 text-[#6FCB8F]" /> },
  { href: "/student/payments", label: "Payment", icon: <Wallet className="size-4 text-[#F2B84B]" /> },
  { href: "/student/registrations", label: "My Registrations", icon: <FileCheck2 className="size-4 text-[#54D6B8]" /> },
  { href: "/student/announcements", label: "Announcements", icon: <Megaphone className="size-4 text-[#5EC3E0]" /> },
  { href: "/student/calendar", label: "Calendar", icon: <CalendarDays className="size-4 text-[#4FB8B0]" /> },
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
      profileHref="/student/profile"
      contentBackgroundClassName="bg-gradient-to-b from-[#eaf7fb] via-[#f6fdfc] to-white"
    >
      {children}
    </DashboardShell>
  );
}
