import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileCheck2,
  Megaphone,
  CalendarDays,
  CalendarCheck,
  Wallet,
  Award,
  GraduationCap,
  ScrollText,
  HandCoins,
  Globe,
} from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStudentNotifications } from "@/lib/notifications/student-feed";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: <LayoutDashboard className="size-4 text-[#5EC3E0]" /> },
  { href: "/student/catalog", label: "Catalog", icon: <BookOpen className="size-4 text-[#4FB8B0]" /> },
  { href: "/student/register", label: "Register", icon: <ClipboardList className="size-4 text-[#6FCB8F]" /> },
  { href: "/student/payments", label: "Payment", icon: <Wallet className="size-4 text-[#F2B84B]" /> },
  { href: "/student/scholarships", label: "Scholarships", icon: <HandCoins className="size-4 text-[#6FCB8F]" /> },
  { href: "/student/registrations", label: "My Registrations", icon: <FileCheck2 className="size-4 text-[#54D6B8]" /> },
  { href: "/student/attendance", label: "Attendance", icon: <CalendarCheck className="size-4 text-[#F2B84B]" /> },
  { href: "/student/academic-record", label: "Academic Record", icon: <GraduationCap className="size-4 text-[#54D6B8]" /> },
  { href: "/student/certificates", label: "Certificates", icon: <Award className="size-4 text-[#6FCB8F]" /> },
  { href: "/student/transcripts", label: "Transcripts", icon: <ScrollText className="size-4 text-[#B98FE0]" /> },
  { href: "/student/announcements", label: "Announcements", icon: <Megaphone className="size-4 text-[#5EC3E0]" /> },
  { href: "/student/forums", label: "Forums", icon: <Globe className="size-4 text-[#4FB8B0]" /> },
  { href: "/student/calendar", label: "Calendar", icon: <CalendarDays className="size-4 text-[#4FB8B0]" /> },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["STUDENT"]);

  const [notificationItems, readRows] = await Promise.all([
    getStudentNotifications(user.id),
    prisma.notificationRead.findMany({ where: { userId: user.id }, select: { key: true } }),
  ]);
  const readKeys = new Set(readRows.map((row) => row.key));
  const notifications = notificationItems.map((item) => ({
    id: item.id,
    title: item.title,
    detail: item.detail,
    href: item.href,
    date: item.date.toISOString(),
    unread: !readKeys.has(item.id),
  }));

  return (
    <DashboardShell
      roleLabel="Student"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Student"}
      userEmail={user.email ?? ""}
      profileHref="/student/profile"
      notifications={notifications}
      contentBackgroundClassName="bg-gradient-to-b from-[#eaf7fb] via-[#f6fdfc] to-white"
    >
      {children}
    </DashboardShell>
  );
}
