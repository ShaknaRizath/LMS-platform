import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { LeaveDecisionActions } from "@/components/hr/leave-decision-actions";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { CalendarClock } from "lucide-react";

export default async function HrLeaveQueuePage() {
  await requireRole(["HR_OFFICER"]);

  const pending = await prisma.staffLeaveRequest.findMany({
    where: { status: "PENDING" },
    include: { staff: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Leave Requests</h1>
        <p className="text-muted-foreground">Requests awaiting a decision, oldest first.</p>
      </div>

      {pending.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarClock />
            </EmptyMedia>
            <EmptyTitle>Nothing pending</EmptyTitle>
            <EmptyDescription>Staff leave requests will appear here for approval.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((request) => (
            <div key={request.id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-sm font-medium">
                {request.staff.firstName} {request.staff.lastName} — {request.type} ·{" "}
                {request.startDate.toLocaleDateString()} – {request.endDate.toLocaleDateString()}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{request.reason}</p>
              <div className="mt-3">
                <LeaveDecisionActions requestId={request.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
