import { requireRole } from "@/lib/auth/rbac";
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";

export default async function AcademicAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  await requireRole(["ACADEMIC_DIRECTOR"]);

  return <AnalyticsDashboard searchParams={searchParams} />;
}
