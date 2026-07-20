import { LayoutDashboard, ClipboardList, Award, Lock, ScrollText } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getStaffLeaveNotifications } from "@/lib/notifications/staff-leave-feed";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

const navItems: NavItem[] = [
  { href: "/examinations", label: "Dashboard", icon: <LayoutDashboard className="size-4" /> },
  { href: "/examinations/exams", label: "Exams", icon: <ClipboardList className="size-4" /> },
  { href: "/examinations/marks", label: "Marks Locking", icon: <Lock className="size-4" /> },
  { href: "/examinations/certificates", label: "Certificates", icon: <Award className="size-4" /> },
  { href: "/examinations/transcripts", label: "Transcripts", icon: <ScrollText className="size-4" /> },
];

export default async function ExaminationUnitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["EXAMINATION_UNIT"]);

  const [notificationItems, readRows] = await Promise.all([
    getStaffLeaveNotifications(user.id),
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
      roleLabel="Examination Unit"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Examination Unit"}
      userEmail={user.email ?? ""}
      leaveHref="/staff/leave"
      profileHref="/examinations/profile"
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
