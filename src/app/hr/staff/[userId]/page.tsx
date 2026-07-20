import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { updateStaffEmploymentDetails } from "@/lib/actions/hr/staff.actions";
import { StaffEmploymentForm } from "@/components/hr/staff-employment-form";
import { LeaveDecisionActions } from "@/components/hr/leave-decision-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function HrStaffDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  await requireRole(["HR_OFFICER"]);

  const staffMember = await prisma.user.findUnique({ where: { id: userId } });
  if (!staffMember || staffMember.role === "STUDENT") notFound();

  const leaveRequests = await prisma.staffLeaveRequest.findMany({
    where: { staffId: userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          {staffMember.firstName} {staffMember.lastName}
        </h1>
        <p className="text-muted-foreground">
          {staffMember.email} · {staffMember.role}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employment details</CardTitle>
        </CardHeader>
        <CardContent>
          <StaffEmploymentForm
            formKey={staffMember.updatedAt.getTime()}
            action={updateStaffEmploymentDetails.bind(null, userId)}
            defaultValues={{
              jobTitle: staffMember.jobTitle,
              department: staffMember.department,
              employmentType: staffMember.employmentType,
              startDate: staffMember.startDate,
              contractEndDate: staffMember.contractEndDate,
            }}
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-foreground">Leave requests</h2>
        {leaveRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No leave requests from this staff member yet.</p>
        ) : (
          leaveRequests.map((request) => (
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
              {request.status === "PENDING" && (
                <div className="mt-3">
                  <LeaveDecisionActions requestId={request.id} />
                </div>
              )}
              {request.decisionNote && (
                <p className="mt-2 text-xs text-muted-foreground">Note: {request.decisionNote}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
