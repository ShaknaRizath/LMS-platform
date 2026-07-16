import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { ScholarshipDecisionActions } from "@/components/finance/scholarship-decision-actions";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { HandCoins } from "lucide-react";

export default async function FinanceScholarshipsPage() {
  await requireRole(["FINANCE"]);

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

      {pending.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HandCoins />
            </EmptyMedia>
            <EmptyTitle>Nothing pending</EmptyTitle>
            <EmptyDescription>Student scholarship applications will appear here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((application) => (
            <div key={application.id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium">
                {application.student.firstName} {application.student.lastName}
                {application.student.program ? ` — ${application.student.program.name}` : ""}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{application.reason}</p>
              <div className="mt-3">
                <ScholarshipDecisionActions scholarshipId={application.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
