import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { createPost, deletePost } from "@/lib/actions/discussion.actions";
import { DiscussionThreadView } from "@/components/shared/discussion-thread-view";

export default async function StudentThreadDetailPage({
  params,
}: {
  params: Promise<{ moduleId: string; threadId: string }>;
}) {
  const { moduleId, threadId } = await params;
  const student = await requireRole(["STUDENT"]);

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_moduleId: { studentId: student.id, moduleId } },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") notFound();

  const thread = await prisma.discussionThread.findUnique({
    where: { id: threadId },
    include: { author: true, posts: { include: { author: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!thread || thread.moduleId !== moduleId) notFound();

  return (
    <DiscussionThreadView
      moduleId={moduleId}
      replyAction={createPost.bind(null, threadId, moduleId)}
      deletePostAction={deletePost}
      thread={{
        id: thread.id,
        title: thread.title,
        body: thread.body,
        authorName: `${thread.author.firstName} ${thread.author.lastName}`,
        createdAt: thread.createdAt,
        isLocked: thread.isLocked,
      }}
      posts={thread.posts.map((post) => ({
        id: post.id,
        body: post.body,
        authorName: `${post.author.firstName} ${post.author.lastName}`,
        createdAt: post.createdAt,
        canDelete: post.authorId === student.id,
      }))}
    />
  );
}
