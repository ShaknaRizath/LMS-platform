import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { STAFF_ROLES } from "@/lib/validation/user.schema";
import { getFinanceNotifications } from "@/lib/notifications/finance-feed";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { FINANCE_NAV_ITEMS } from "@/app/finance/layout";

export default async function StaffLeaveLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(STAFF_ROLES);

  // Only Finance gets the full dashboard shell around this shared page for now — every other
  // role still gets the plain wrapper below (this is a scoped UI change, not a rollout to the
  // whole app).
  if (user.role === "FINANCE") {
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
        navItems={FINANCE_NAV_ITEMS}
        userName={user.name ?? user.email ?? "Finance"}
        userEmail={user.email ?? ""}
        homeHref="/finance"
        profileHref="/finance/profile"
        notifications={notifications}
        contentBackgroundClassName="bg-gradient-to-b from-[#eef0fd] via-[#eceffa] to-white"
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">{children}</div>
      </DashboardShell>
    );
  }

  return <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">{children}</div>;
}
