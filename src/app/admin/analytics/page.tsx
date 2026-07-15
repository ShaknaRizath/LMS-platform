import { requireRole } from "@/lib/auth/rbac";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireRole(["SUPER_ADMIN", "CAMPUS_ADMIN"]);

  return <AnalyticsDashboard searchParams={searchParams} />;
}
