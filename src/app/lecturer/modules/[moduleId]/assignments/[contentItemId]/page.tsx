import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { GradeRow } from "@/components/lecturer/grade-row";

export default async function LecturerAssignmentGradingPage({
  params,
}: {
  params: Promise<{ moduleId: string; contentItemId: string }>;
}) {
  const { moduleId, contentItemId } = await params;
  const lecturer = await requireRole(["LECTURER"]);

  const assignment = await prisma.lecturerModuleAssignment.findUnique({
    where: { lecturerId_moduleId: { lecturerId: lecturer.id, moduleId } },
  });
  if (!assignment) notFound();

  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
    include: { week: true },
  });
  if (!contentItem || !contentItem.isAssignment || contentItem.week.moduleId !== moduleId) notFound();

  const [enrollments, submissions] = await Promise.all([
    prisma.enrollment.findMany({
      where: { moduleId, status: "ACTIVE" },
      include: { student: true },
      orderBy: { student: { firstName: "asc" } },
    }),
    prisma.submission.findMany({ where: { contentItemId } }),
  ]);

  const submissionByStudentId = new Map(submissions.map((submission) => [submission.studentId, submission]));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{contentItem.title}</h1>
        <p className="text-muted-foreground">
          {contentItem.dueDate ? `Due ${contentItem.dueDate.toLocaleDateString()}` : "No due date"} ·{" "}
          {submissions.length} / {enrollments.length} submitted
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {enrollments.map((enrollment) => {
          const submission = submissionByStudentId.get(enrollment.studentId);
          return (
            <GradeRow
              key={enrollment.id}
              studentName={`${enrollment.student.firstName} ${enrollment.student.lastName}`}
              moduleId={moduleId}
              contentItemId={contentItemId}
              submission={
                submission
                  ? {
                      id: submission.id,
                      textResponse: submission.textResponse,
                      fileUrl: submission.fileUrl,
                      submittedAt: submission.submittedAt,
                      grade: submission.grade ? Number(submission.grade) : null,
                      feedback: submission.feedback,
                      gradedAt: submission.gradedAt,
                    }
                  : null
              }
            />
          );
        })}
      </div>
    </div>
  );
}
