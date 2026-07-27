import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { PendingScholarshipsList } from "@/components/shared/pending-scholarships-list";

export default async function AdminScholarshipsPage() {
  await requireRole(["SUPER_ADMIN", "CAMPUS_ADMIN"]);

  const pending = await prisma.scholarship.findMany({
    where: { status: "PENDING" },
    include: { student: { include: { program: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Scholarships</h1>
        <p className="text-muted-foreground">Applications awaiting a decision, oldest first.</p>
      </div>

      <PendingScholarshipsList applications={pending} />
    </div>
  );
}
