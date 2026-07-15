import { requireRole } from "@/lib/auth/rbac";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default async function CoordinatorAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireRole(["PROGRAM_COORDINATOR"]);

  return <AnalyticsDashboard searchParams={searchParams} />;
}
