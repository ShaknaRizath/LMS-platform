import { LayoutDashboard, ClipboardCheck, BarChart3, GraduationCap, HandCoins } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { getFinanceNotifications } from "@/lib/notifications/finance-feed";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";

// Reuses the exact Cosmic Blues / Soft Whisper palette from the Program Coordinator dashboard
// (COORDINATOR_PALETTE, src/components/coordinator/palette.ts) rather than a Finance-specific
// swatch — same per-icon coloring convention as every other layout (see src/app/student/layout.tsx).
const navItems: NavItem[] = [
  { href: "/finance", label: "Dashboard", icon: <LayoutDashboard className="size-4 text-[#2B1FFF]" /> },
  { href: "/finance/registrations", label: "Registrations", icon: <ClipboardCheck className="size-4 text-[#4356C4]" /> },
  { href: "/finance/programs", label: "Programs & Fees", icon: <GraduationCap className="size-4 text-[#8FA6E3]" /> },
  { href: "/finance/scholarships", label: "Scholarships", icon: <HandCoins className="size-4 text-[#140F91]" /> },
  { href: "/finance/reports", label: "Reports", icon: <BarChart3 className="size-4 text-[#5D6685]" /> },
];

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireRole(["FINANCE"]);

  const [notificationItems, readRows] = await Promise.all([
    getFinanceNotifications(user.id),
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
      roleLabel="Finance Staff"
      navItems={navItems}
      userName={user.name ?? user.email ?? "Finance"}
      userEmail={user.email ?? ""}
      leaveHref="/staff/leave"
      profileHref="/finance/profile"
      notifications={notifications}
      contentBackgroundClassName="bg-gradient-to-b from-[#eef0fd] via-[#eceffa] to-white"
    >
      {children}
    </DashboardShell>
  );
}
