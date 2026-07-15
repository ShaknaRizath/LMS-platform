import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { ApplicationsQueue } from "@/components/admissions/applications-queue";

const STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireRole(["SUPER_ADMIN", "CAMPUS_ADMIN"]);
  const { status } = await searchParams;
  const activeStatus = STATUSES.includes(status as (typeof STATUSES)[number]) ? status : undefined;

  const applications = await prisma.application.findMany({
    where: activeStatus ? { status: activeStatus as (typeof STATUSES)[number] } : undefined,
    include: { program: true },
    orderBy: { submittedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Applications</h1>
        <p className="text-muted-foreground">Review and decide on prospective-student applications.</p>
      </div>
      <ApplicationsQueue basePath="/admin/applications" activeStatus={activeStatus} applications={applications} />
    </div>
  );
}
