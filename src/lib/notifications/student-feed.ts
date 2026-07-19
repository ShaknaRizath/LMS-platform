import "server-only";
import { prisma } from "@/lib/db/prisma";

export type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  date: Date;
  href: string;
};

const FEED_LIMIT = 8;

/**
 * In-app notification feed for a student's header bell — graded assignments, published
 * quiz results, announcements, and replies to threads they started or posted in.
 * Distinct from NotificationLog (src/lib/notifications/index.ts), which audits outbound
 * emails, not in-app read state.
 */
export async function getStudentNotifications(studentId: string): Promise<NotificationItem[]> {
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId, status: "ACTIVE" },
    select: { moduleId: true },
  });
  const moduleIds = enrollments.map((enrollment) => enrollment.moduleId);

  const [gradedSubmissions, publishedAttempts, announcements, participantThreads] = await Promise.all([
    prisma.submission.findMany({
      where: { studentId, gradedAt: { not: null } },
      include: { contentItem: { include: { week: { include: { module: true } } } } },
      orderBy: { gradedAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.quizAttempt.findMany({
      where: { studentId, resultsPublishedAt: { not: null } },
      include: { quiz: { include: { module: true } } },
      orderBy: { resultsPublishedAt: "desc" },
      take: FEED_LIMIT,
    }),
    prisma.announcement.findMany({
      where: { OR: [{ scope: "INSTITUTION" }, { moduleId: { in: moduleIds } }] },
      include: { module: true },
      orderBy: { publishedAt: "desc" },
      take: FEED_LIMIT,
    }),
    // Threads this student either started or replied in — the "subscribed" set for the
    // reply-notification query below, which must run after this one resolves.
    prisma.discussionThread.findMany({
      where: { OR: [{ authorId: studentId }, { posts: { some: { authorId: studentId } } }] },
      select: { id: true },
    }),
  ]);

  const subscribedThreadIds = participantThreads.map((thread) => thread.id);
  const replies = await prisma.discussionPost.findMany({
    where: { threadId: { in: subscribedThreadIds }, authorId: { not: studentId } },
    include: { author: true, thread: { include: { module: true } } },
    orderBy: { createdAt: "desc" },
    take: FEED_LIMIT,
  });

  const items: NotificationItem[] = [
    ...gradedSubmissions.map((submission) => ({
      id: `submission-${submission.id}`,
      title: `"${submission.contentItem.title}" graded`,
      detail: `${submission.contentItem.week.module.code}${
        submission.grade != null ? ` · ${Number(submission.grade)}` : ""
      }`,
      date: submission.gradedAt!,
      href: `/student/modules/${submission.contentItem.week.moduleId}/assignments/${submission.contentItemId}`,
    })),
    ...publishedAttempts.map((attempt) => ({
      id: `quiz-${attempt.id}`,
      title: `"${attempt.quiz.title}" results published`,
      detail: `${attempt.quiz.module.code}${
        attempt.pointsEarned != null && attempt.totalPoints
          ? ` · ${attempt.pointsEarned}/${attempt.totalPoints}`
          : ""
      }`,
      date: attempt.resultsPublishedAt!,
      href: `/student/modules/${attempt.quiz.moduleId}/quizzes/${attempt.quizId}/attempt/${attempt.id}`,
    })),
    ...announcements.map((announcement) => ({
      id: `announcement-${announcement.id}`,
      title: announcement.title,
      detail: announcement.module ? announcement.module.code : "Institution-wide",
      date: announcement.publishedAt,
      href: announcement.moduleId
        ? `/student/modules/${announcement.moduleId}`
        : `/student/announcements`,
    })),
    ...replies.map((post) => ({
      id: `discussion-post-${post.id}`,
      title: `New reply in "${post.thread.title}"`,
      detail: `${post.author.firstName} ${post.author.lastName}${
        post.thread.module ? ` · ${post.thread.module.code}` : ""
      }`,
      date: post.createdAt,
      href: post.thread.moduleId
        ? `/student/modules/${post.thread.moduleId}/discussions/${post.threadId}`
        : `/student/forums/${post.threadId}`,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, FEED_LIMIT);

  return items;
}
