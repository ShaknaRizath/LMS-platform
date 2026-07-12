import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RegistrationStatusBadge } from "@/components/shared/registration-status-badge";
import { DashboardHeaderCard } from "@/components/student/dashboard-header-card";

export default async function StudentDashboardPage() {
  const student = await requireRole(["STUDENT"]);

  const [latestRegistration, enrollments] = await Promise.all([
    prisma.semesterRegistration.findFirst({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      include: { paymentRecords: { orderBy: { uploadedAt: "desc" }, take: 1 } },
    }),
    prisma.enrollment.findMany({
      where: { studentId: student.id, status: "ACTIVE" },
      include: { module: true },
      orderBy: { module: { code: "asc" } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeaderCard
        title="Student Dashboard"
        subtitle="Your enrolled modules, notices, and registration status."
        stats={[
          {
            label: "Registration status",
            value: latestRegistration ? (
              <RegistrationStatusBadge status={latestRegistration.status} />
            ) : (
              "Not registered"
            ),
          },
          { label: "Enrolled modules", value: enrollments.length },
          {
            label: "Payment status",
            value: latestRegistration?.paymentRecords[0]?.verificationStatus ?? "—",
          },
        ]}
      />

      {enrollments.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-foreground">My modules</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.map((enrollment) => (
              <Link key={enrollment.id} href={`/student/modules/${enrollment.moduleId}`}>
                <Card className="h-full transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <CardDescription>{enrollment.module.code}</CardDescription>
                    <CardTitle>{enrollment.module.title}</CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
