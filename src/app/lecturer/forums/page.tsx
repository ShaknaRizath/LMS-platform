import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { createForumThread } from "@/lib/actions/discussion.actions";
import { FORUM_CATEGORY_OPTIONS, FORUM_CATEGORY_LABELS } from "@/lib/validation/discussion.schema";
import { DiscussionThreadList } from "@/components/shared/discussion-thread-list";

export default async function LecturerForumsPage() {
  await requireRole(["LECTURER"]);

  const threads = await prisma.discussionThread.findMany({
    where: { scope: "INSTITUTION" },
    include: { author: true, _count: { select: { posts: true } } },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <DiscussionThreadList
      basePath="/lecturer/forums"
      createThreadAction={createForumThread}
      heading="Forums"
      emptyDescription="Start the first institution-wide discussion."
      categories={FORUM_CATEGORY_OPTIONS.map((category) => ({ value: category, label: FORUM_CATEGORY_LABELS[category] }))}
      threads={threads.map((thread) => ({
        id: thread.id,
        title: thread.title,
        category: thread.category ? FORUM_CATEGORY_LABELS[thread.category] : null,
        isPinned: thread.isPinned,
        isLocked: thread.isLocked,
        authorName: `${thread.author.firstName} ${thread.author.lastName}`,
        createdAt: thread.createdAt,
        postCount: thread._count.posts,
      }))}
    />
  );
}
