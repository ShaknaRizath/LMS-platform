import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { submitAssignment } from "@/lib/actions/student/submission.actions";
import { SubmissionForm } from "@/components/student/submission-form";
import { Badge } from "@/components/ui/badge";

export default async function StudentAssignmentPage({
  params,
}: {
  params: Promise<{ moduleId: string; contentItemId: string }>;
}) {
  const { moduleId, contentItemId } = await params;
  const student = await requireRole(["STUDENT"]);

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_moduleId: { studentId: student.id, moduleId } },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") notFound();

  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
    include: { week: true },
  });
  if (
    !contentItem ||
    !contentItem.isAssignment ||
    contentItem.week.moduleId !== moduleId ||
    contentItem.status !== "PUBLISHED"
  ) {
    notFound();
  }

  const submission = await prisma.submission.findUnique({
    where: { contentItemId_studentId: { contentItemId, studentId: student.id } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{contentItem.title}</h1>
        <p className="text-muted-foreground">
          {contentItem.dueDate ? `Due ${contentItem.dueDate.toLocaleDateString()}` : "No due date"}
        </p>
      </div>

      {contentItem.description && <p className="text-sm text-muted-foreground">{contentItem.description}</p>}

      {submission?.gradedAt ? (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Graded</Badge>
            <span className="text-lg font-semibold text-foreground">
              {submission.grade ? Number(submission.grade) : "—"} / 100
            </span>
          </div>
          {submission.feedback && <p className="text-sm text-muted-foreground">{submission.feedback}</p>}
          <div className="flex flex-col gap-1 border-t border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground">Your submission</p>
            {submission.textResponse && (
              <p className="whitespace-pre-wrap text-sm">{submission.textResponse}</p>
            )}
            {submission.fileUrl && (
              <a
                href={submission.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit text-sm text-primary hover:underline"
              >
                View your uploaded file
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {submission && (
            <p className="text-sm text-muted-foreground">
              Submitted {submission.submittedAt.toLocaleDateString()} — you can update your submission until
              it&apos;s graded.
            </p>
          )}
          <SubmissionForm
            action={submitAssignment.bind(null, contentItemId, moduleId)}
            studentId={student.id}
            defaultTextResponse={submission?.textResponse}
          />
        </div>
      )}
    </div>
  );
}
