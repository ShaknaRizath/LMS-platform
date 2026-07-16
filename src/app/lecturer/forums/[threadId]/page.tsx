import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { createPost, deletePost } from "@/lib/actions/discussion.actions";
import { DiscussionThreadView } from "@/components/shared/discussion-thread-view";
import { ThreadModerationActions } from "@/components/lecturer/thread-moderation-actions";

export default async function LecturerForumThreadDetailPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  await requireRole(["LECTURER"]);

  const thread = await prisma.discussionThread.findUnique({
    where: { id: threadId },
    include: { author: true, posts: { include: { author: true }, orderBy: { createdAt: "asc" } } },
  });
  if (!thread || thread.scope !== "INSTITUTION") notFound();

  return (
    <DiscussionThreadView
      moduleId={null}
      replyAction={createPost.bind(null, threadId, null)}
      deletePostAction={deletePost}
      moderationActions={
        <ThreadModerationActions
          threadId={threadId}
          moduleId={null}
          isPinned={thread.isPinned}
          isLocked={thread.isLocked}
        />
      }
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
        canDelete: true,
      }))}
    />
  );
}
