import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { EnrolledCoursesTable } from "@/components/student/enrolled-courses-table";

export default async function StudentCoursesPage() {
  const student = await requireRole(["STUDENT"]);

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: student.id },
    include: {
      module: {
        include: {
          lecturerAssignments: { include: { lecturer: true }, take: 1 },
          weeks: { include: { _count: { select: { contentItems: true } } } },
        },
      },
    },
    orderBy: { module: { code: "asc" } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Courses</h1>
        <p className="text-sm text-muted-foreground">All modules you&apos;re currently or previously enrolled in.</p>
      </div>

      <EnrolledCoursesTable
        courses={enrollments.map((enrollment) => ({
          id: enrollment.id,
          moduleId: enrollment.moduleId,
          code: enrollment.module.code,
          title: enrollment.module.title,
          lessons: enrollment.module.weeks.reduce((sum, week) => sum + week._count.contentItems, 0),
          credits: enrollment.module.credits,
          instructor: enrollment.module.lecturerAssignments[0]
            ? `${enrollment.module.lecturerAssignments[0].lecturer.firstName} ${enrollment.module.lecturerAssignments[0].lecturer.lastName}`
            : null,
          status: enrollment.status,
        }))}
      />
    </div>
  );
}
