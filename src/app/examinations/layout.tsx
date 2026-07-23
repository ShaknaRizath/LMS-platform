import { LayoutDashboard, ClipboardList, Award, Lock, ScrollText } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getExaminationNotifications } from "@/lib/notifications/examination-feed";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

// Reuses the exact Cosmic Blues / Soft Whisper palette from the Finance and Program Coordinator
// dashboards (COORDINATOR_PALETTE, src/components/coordinator/palette.ts) rather than an
// Examination-specific swatch — same per-icon coloring convention as every other layout. The
// dashboard page itself already used this palette; only the sidebar/background were left plain.
const navItems: NavItem[] = [
  { href: "/examinations", label: "Dashboard", icon: <LayoutDashboard className="size-4 text-[#2B1FFF]" /> },
  { href: "/examinations/exams", label: "Exams", icon: <ClipboardList className="size-4 text-[#4356C4]" /> },
  { href: "/examinations/marks", label: "Marks Locking", icon: <Lock className="size-4 text-[#8FA6E3]" /> },
  { href: "/examinations/certificates", label: "Certificates", icon: <Award className="size-4 text-[#140F91]" /> },
  { href: "/examinations/transcripts", label: "Transcripts", icon: <ScrollText className="size-4 text-[#5D6685]" /> },
];

export default async function ExaminationUnitLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["EXAMINATION_UNIT"]);

  const [notificationItems, readRows] = await Promise.all([
    getExaminationNotifications(user.id),
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
      contentBackgroundClassName="bg-gradient-to-b from-[#eef0fd] via-[#eceffa] to-white"
    >
      {children}
    </DashboardShell>
  );
}
