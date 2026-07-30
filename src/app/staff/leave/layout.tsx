import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { STAFF_ROLES } from "@/lib/validation/user.schema";
import { DashboardShell, type NavItem } from "@/components/layout/dashboard-shell";
import type { NotificationItem } from "@/lib/notifications/student-feed";

import { getAdminNotifications } from "@/lib/notifications/admin-feed";
import { getAcademicDirectorNotifications } from "@/lib/notifications/academic-feed";
import { getCoordinatorNotifications } from "@/lib/notifications/coordinator-feed";
import { getLecturerNotifications } from "@/lib/notifications/lecturer-feed";
import { getFinanceNotifications } from "@/lib/notifications/finance-feed";
import { getMarketingNotifications } from "@/lib/notifications/marketing-feed";
import { getExaminationNotifications } from "@/lib/notifications/examination-feed";
import { getHrNotifications } from "@/lib/notifications/hr-feed";
import { getStaffLeaveNotifications } from "@/lib/notifications/staff-leave-feed";

import { ADMIN_NAV_ITEMS } from "@/app/admin/layout";
import { ACADEMIC_NAV_ITEMS } from "@/app/academic/layout";
import { COORDINATOR_NAV_ITEMS } from "@/app/coordinator/layout";
import { LECTURER_NAV_ITEMS } from "@/app/lecturer/layout";
import { FINANCE_NAV_ITEMS } from "@/app/finance/layout";
import { MARKETING_NAV_ITEMS } from "@/app/marketing/layout";
import { EXAMINATION_NAV_ITEMS } from "@/app/examinations/layout";
import { HR_NAV_ITEMS } from "@/app/hr/layout";
import { LIBRARY_NAV_ITEMS } from "@/app/library/layout";

type ShellConfig = {
  roleLabel: string;
  navItems: NavItem[];
  getNotifications: (userId: string) => Promise<NotificationItem[]>;
  homeHref: string;
  profileHref: string;
  contentBackgroundClassName?: string;
  fallbackName: string;
};

// Every STAFF_ROLES entry gets the same dashboard shell (sidebar, notification bell, profile
// menu) wrapped around this one shared leave-request page — same navItems/notification
// feed/background each role's own dashboard already uses, imported rather than duplicated, plus
// a homeHref (not leaveHref — a "My Leave" shortcut back to the page you're already on is
// pointless) pointing at that role's own dashboard.
const SHELL_CONFIG: Record<(typeof STAFF_ROLES)[number], ShellConfig> = {
  SUPER_ADMIN: {
    roleLabel: "Super Administrator",
    navItems: ADMIN_NAV_ITEMS,
    getNotifications: getAdminNotifications,
    homeHref: "/admin",
    profileHref: "/admin/profile",
    contentBackgroundClassName: "bg-gradient-to-b from-[#eef1f8] via-[#f5f0e8] to-white",
    fallbackName: "Admin",
  },
  CAMPUS_ADMIN: {
    roleLabel: "Campus Administrator",
    navItems: ADMIN_NAV_ITEMS,
    getNotifications: getAdminNotifications,
    homeHref: "/admin",
    profileHref: "/admin/profile",
    contentBackgroundClassName: "bg-gradient-to-b from-[#eef1f8] via-[#f5f0e8] to-white",
    fallbackName: "Admin",
  },
  ACADEMIC_DIRECTOR: {
    roleLabel: "Academic Director",
    navItems: ACADEMIC_NAV_ITEMS,
    getNotifications: getAcademicDirectorNotifications,
    homeHref: "/academic",
    profileHref: "/academic/profile",
    contentBackgroundClassName: "bg-gradient-to-b from-[#fdeef1] via-[#f8eaed] to-white",
    fallbackName: "Academic Director",
  },
  PROGRAM_COORDINATOR: {
    roleLabel: "Program Coordinator",
    navItems: COORDINATOR_NAV_ITEMS,
    getNotifications: getCoordinatorNotifications,
    homeHref: "/coordinator",
    profileHref: "/coordinator/profile",
    contentBackgroundClassName: "bg-gradient-to-b from-[#eef0fd] via-[#eceffa] to-white",
    fallbackName: "Program Coordinator",
  },
  LECTURER: {
    roleLabel: "Lecturer",
    navItems: LECTURER_NAV_ITEMS,
    getNotifications: getLecturerNotifications,
    homeHref: "/lecturer",
    profileHref: "/lecturer/profile",
    contentBackgroundClassName: "bg-gradient-to-b from-[#f4effa] via-[#faf3f8] to-white",
    fallbackName: "Lecturer",
  },
  FINANCE: {
    roleLabel: "Finance Staff",
    navItems: FINANCE_NAV_ITEMS,
    getNotifications: getFinanceNotifications,
    homeHref: "/finance",
    profileHref: "/finance/profile",
    contentBackgroundClassName: "bg-gradient-to-b from-[#eef0fd] via-[#eceffa] to-white",
    fallbackName: "Finance",
  },
  MARKETING_OFFICER: {
    roleLabel: "Marketing Officer",
    navItems: MARKETING_NAV_ITEMS,
    getNotifications: getMarketingNotifications,
    homeHref: "/marketing",
    profileHref: "/marketing/profile",
    contentBackgroundClassName: "bg-gradient-to-b from-[#eef0fd] via-[#eceffa] to-white",
    fallbackName: "Marketing Officer",
  },
  EXAMINATION_UNIT: {
    roleLabel: "Examination Unit",
    navItems: EXAMINATION_NAV_ITEMS,
    getNotifications: getExaminationNotifications,
    homeHref: "/examinations",
    profileHref: "/examinations/profile",
    contentBackgroundClassName: "bg-gradient-to-b from-[#eef0fd] via-[#eceffa] to-white",
    fallbackName: "Examination Unit",
  },
  LIBRARY_OFFICER: {
    roleLabel: "Library Officer",
    navItems: LIBRARY_NAV_ITEMS,
    getNotifications: getStaffLeaveNotifications,
    homeHref: "/library",
    profileHref: "/library/profile",
    fallbackName: "Library Officer",
  },
  HR_OFFICER: {
    roleLabel: "HR Officer",
    navItems: HR_NAV_ITEMS,
    getNotifications: getHrNotifications,
    homeHref: "/hr",
    profileHref: "/hr/profile",
    contentBackgroundClassName: "bg-gradient-to-b from-[#eef0fd] via-[#eceffa] to-white",
    fallbackName: "HR Officer",
  },
};

export default async function StaffLeaveLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(STAFF_ROLES);
  // requireRole(STAFF_ROLES) guarantees user.role is never "STUDENT" at runtime, but its return
  // type isn't narrowed from the roles array passed in — safe to assert here.
  const config = SHELL_CONFIG[user.role as (typeof STAFF_ROLES)[number]];

  const [notificationItems, readRows] = await Promise.all([
    config.getNotifications(user.id),
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
      roleLabel={config.roleLabel}
      navItems={config.navItems}
      userName={user.name ?? user.email ?? config.fallbackName}
      userEmail={user.email ?? ""}
      homeHref={config.homeHref}
      profileHref={config.profileHref}
      notifications={notifications}
      contentBackgroundClassName={config.contentBackgroundClassName}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">{children}</div>
    </DashboardShell>
  );
}
