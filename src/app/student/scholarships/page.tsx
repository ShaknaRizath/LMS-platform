import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { ScholarshipApplicationForm } from "@/components/student/scholarship-application-form";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { GraduationCap } from "lucide-react";

export default async function StudentScholarshipsPage() {
  const student = await requireRole(["STUDENT"]);

  const applications = await prisma.scholarship.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Scholarships</h1>
        <p className="text-muted-foreground">Apply for a scholarship and track your application.</p>
      </div>

      <ScholarshipApplicationForm />

      {applications.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GraduationCap />
            </EmptyMedia>
            <EmptyTitle>No applications yet</EmptyTitle>
            <EmptyDescription>Applications you submit will appear here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-2">
          {applications.map((application) => (
            <div key={application.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-medium">
                  {application.status === "APPROVED" && application.discountType
                    ? `Approved — ${
                        application.discountType === "PERCENTAGE"
                          ? `${Number(application.discountValue)}% off`
                          : `LKR ${Number(application.discountValue)} off`
                      }`
                    : "Application"}
                </p>
                <Badge
                  variant={
                    application.status === "APPROVED"
                      ? "default"
                      : application.status === "REJECTED"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {application.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{application.reason}</p>
              {application.decisionNote && (
                <p className="mt-1 text-xs text-muted-foreground">Note: {application.decisionNote}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
