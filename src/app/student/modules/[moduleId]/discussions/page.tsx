import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { createThread } from "@/lib/actions/discussion.actions";
import { DiscussionThreadList } from "@/components/shared/discussion-thread-list";

export default async function StudentDiscussionsPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const student = await requireRole(["STUDENT"]);

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_moduleId: { studentId: student.id, moduleId } },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") notFound();

  const threads = await prisma.discussionThread.findMany({
    where: { moduleId },
    include: { author: true, _count: { select: { posts: true } } },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <DiscussionThreadList
      basePath={`/student/modules/${moduleId}/discussions`}
      createThreadAction={createThread.bind(null, moduleId)}
      threads={threads.map((thread) => ({
        id: thread.id,
        title: thread.title,
        isPinned: thread.isPinned,
        isLocked: thread.isLocked,
        authorName: `${thread.author.firstName} ${thread.author.lastName}`,
        createdAt: thread.createdAt,
        postCount: thread._count.posts,
      }))}
    />
  );
}
