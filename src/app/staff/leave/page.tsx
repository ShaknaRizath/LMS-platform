import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { STAFF_ROLES } from "@/lib/validation/user.schema";
import { LeaveRequestForm } from "@/components/staff/leave-request-form";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { CalendarClock } from "lucide-react";

export default async function StaffLeavePage() {
  const user = await requireRole(STAFF_ROLES);

  const requests = await prisma.staffLeaveRequest.findMany({
    where: { staffId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Leave</h1>
        <p className="text-muted-foreground">Request time off and track the status of your requests.</p>
      </div>

      <LeaveRequestForm />

      {requests.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarClock />
            </EmptyMedia>
            <EmptyTitle>No leave requests yet</EmptyTitle>
            <EmptyDescription>Requests you submit will appear here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {requests.map((request) => (
            <div key={request.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium">
                  {request.type} · {request.startDate.toLocaleDateString()} –{" "}
                  {request.endDate.toLocaleDateString()}
                </p>
                <Badge
                  variant={
                    request.status === "APPROVED"
                      ? "default"
                      : request.status === "REJECTED"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {request.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{request.reason}</p>
              {request.decisionNote && (
                <p className="mt-1 text-xs text-muted-foreground">Note: {request.decisionNote}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
