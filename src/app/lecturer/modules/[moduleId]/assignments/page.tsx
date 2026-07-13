import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default async function LecturerAssignmentsPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const lecturer = await requireRole(["LECTURER"]);

  const assignment = await prisma.lecturerModuleAssignment.findUnique({
    where: { lecturerId_moduleId: { lecturerId: lecturer.id, moduleId } },
  });
  if (!assignment) notFound();

  const [assignmentItems, enrolledCount] = await Promise.all([
    prisma.contentItem.findMany({
      where: { isAssignment: true, week: { moduleId } },
      include: { _count: { select: { submissions: true } } },
      orderBy: { dueDate: "asc" },
    }),
    prisma.enrollment.count({ where: { moduleId, status: "ACTIVE" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Assignments</h1>

      {assignmentItems.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ClipboardList />
            </EmptyMedia>
            <EmptyTitle>No assignments yet</EmptyTitle>
            <EmptyDescription>
              Flag a content item as an assignment (with a due date) to have it appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {assignmentItems.map((item) => (
            <Link key={item.id} href={`/lecturer/modules/${moduleId}/assignments/${item.id}`}>
              <Card className="transition-colors hover:bg-muted/40">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>
                        {item.dueDate ? `Due ${item.dueDate.toLocaleDateString()}` : "No due date"} ·{" "}
                        {item._count.submissions} / {enrolledCount} submitted
                      </CardDescription>
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
