import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { DashboardHeaderCard } from "@/components/student/dashboard-header-card";
import { MiniCalendarCard } from "@/components/student/mini-calendar-card";
import { NoticeBoardCard } from "@/components/student/notice-board-card";
import { ActivityCard, type ActivityItem } from "@/components/student/activity-card";
import { LECTURER_PALETTE } from "@/components/lecturer/palette";
import { UpcomingClassesCard, type UpcomingClassItem } from "@/components/lecturer/upcoming-classes-card";
import { ToGradeCard, type ToGradeItem } from "@/components/lecturer/to-grade-card";
import { MyModulesTable } from "@/components/lecturer/my-modules-table";
import type { DayOfWeek } from "@/generated/prisma/client";

const DAY_ORDER: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function nextOccurrence(session: { dayOfWeek: DayOfWeek; startTime: string }, now: Date): Date {
  const todayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const sessionIndex = DAY_ORDER.indexOf(session.dayOfWeek);
  let dayDiff = sessionIndex - todayIndex;
  if (dayDiff < 0) dayDiff += 7;

  const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  candidate.setDate(candidate.getDate() + dayDiff);
  const [hours, minutes] = session.startTime.split(":").map(Number);
  candidate.setHours(hours, minutes, 0, 0);

  if (dayDiff === 0 && candidate < now) {
    candidate.setDate(candidate.getDate() + 7);
  }
  return candidate;
}

export default async function LecturerDashboardPage() {
  const lecturer = await requireRole(["LECTURER"]);

  const now = new Date();

  const [
    assignments,
    activeEnrollments,
    classSessions,
    ungradedSubmissions,
    announcements,
    recentPublishedContent,
    recentlyGraded,
    calendarEvents,
    profile,
  ] = await Promise.all([
    prisma.lecturerModuleAssignment.findMany({
      where: { lecturerId: lecturer.id },
      include: { module: { include: { weeks: { include: { _count: { select: { contentItems: true } } } } } } },
    }),
    prisma.enrollment.findMany({
      where: { status: "ACTIVE", module: { lecturerAssignments: { some: { lecturerId: lecturer.id } } } },
      select: { moduleId: true },
    }),
    prisma.classSession.findMany({
      where: { lecturerId: lecturer.id },
      include: { module: true },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    }),
    prisma.submission.findMany({
      where: {
        gradedAt: null,
        contentItem: { isAssignment: true, week: { module: { lecturerAssignments: { some: { lecturerId: lecturer.id } } } } },
      },
      include: { contentItem: { include: { week: { include: { module: true } } } }, student: true },
      orderBy: { submittedAt: "asc" },
      take: 5,
    }),
    prisma.announcement.findMany({
      where: {
        OR: [{ scope: "INSTITUTION" }, { module: { lecturerAssignments: { some: { lecturerId: lecturer.id } } } }],
      },
      include: { module: true },
      orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
      take: 4,
    }),
    prisma.contentItem.findMany({
      where: { status: "PUBLISHED", week: { module: { lecturerAssignments: { some: { lecturerId: lecturer.id } } } } },
      include: { week: { include: { module: true } } },
      orderBy: { publishedAt: "desc" },
      take: 4,
    }),
    prisma.submission.findMany({
      where: { gradedById: lecturer.id, gradedAt: { not: null } },
      include: { contentItem: { include: { week: { include: { module: true } } } } },
      orderBy: { gradedAt: "desc" },
      take: 4,
    }),
    prisma.calendarEvent.findMany({ orderBy: { startDate: "asc" } }),
    prisma.user.findUnique({ where: { id: lecturer.id }, select: { avatarUrl: true } }),
  ]);

  const moduleIds = assignments.map((assignment) => assignment.moduleId);
  const enrolledCountByModule = new Map<string, number>();
  for (const enrollment of activeEnrollments) {
    enrolledCountByModule.set(enrollment.moduleId, (enrolledCountByModule.get(enrollment.moduleId) ?? 0) + 1);
  }

  const upcomingClasses: UpcomingClassItem[] = classSessions
    .map((session) => ({ session, at: nextOccurrence(session, now) }))
    .sort((a, b) => a.at.getTime() - b.at.getTime())
    .slice(0, 4)
    .map(({ session, at }) => ({
      id: session.id,
      moduleId: session.moduleId,
      moduleCode: session.module.code,
      room: session.room,
      dayLabel: at.toLocaleDateString(undefined, { weekday: "short" }),
      timeRange: `${session.startTime}-${session.endTime}`,
    }));

  const toGradeItems: ToGradeItem[] = ungradedSubmissions.map((submission) => ({
    id: submission.id,
    kind: "SUBMISSION",
    title: submission.contentItem.title,
    subtitle: `${submission.contentItem.week.module.code} · ${submission.student.firstName} ${submission.student.lastName}`,
    href: `/lecturer/modules/${submission.contentItem.week.moduleId}`,
  }));

  const activity: ActivityItem[] = [
    ...recentPublishedContent.map((item) => ({
      id: `content-${item.id}`,
      label: item.title,
      detail: `Published in ${item.week.module.code}`,
      date: item.publishedAt ?? item.createdAt,
      kind: "content" as const,
    })),
    ...recentlyGraded.map((submission) => ({
      id: `grade-${submission.id}`,
      label: submission.contentItem.title,
      detail: `Graded in ${submission.contentItem.week.module.code}${submission.grade ? ` · ${submission.grade}` : ""}`,
      date: submission.gradedAt!,
      kind: "grade" as const,
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeaderCard
        title={`Welcome back, ${lecturer.name?.split(" ")[0] ?? "Lecturer"}`}
        subtitle="Your modules, classes, and grading queue."
        palette={LECTURER_PALETTE}
        className="bg-gradient-to-br from-[#f4effa] via-[#fbf1f7] to-[#fdf3e9]"
        stats={[
          { label: "My modules", value: moduleIds.length },
          { label: "Enrolled students", value: activeEnrollments.length },
          { label: "Classes this week", value: classSessions.length },
          { label: "To grade", value: toGradeItems.length },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <UpcomingClassesCard classes={upcomingClasses} />
        <ToGradeCard items={toGradeItems} />
        <MiniCalendarCard
          events={calendarEvents}
          todayColor={LECTURER_PALETTE[3].accent}
          dotColor={LECTURER_PALETTE[0].accent}
          flatBackground
          monthTitleHeader
        />
        <ActivityCard
          className="lg:row-span-2"
          userName={lecturer.name ?? lecturer.email ?? "Lecturer"}
          avatarUrl={profile?.avatarUrl}
          activity={activity}
          palette={LECTURER_PALETTE}
        />

        <div className="lg:col-span-2">
          <MyModulesTable
            modules={assignments.map((assignment) => ({
              id: assignment.moduleId,
              code: assignment.module.code,
              title: assignment.module.title,
              enrolledStudents: enrolledCountByModule.get(assignment.moduleId) ?? 0,
              lessons: assignment.module.weeks.reduce((sum, week) => sum + week._count.contentItems, 0),
              credits: assignment.module.credits,
            }))}
          />
        </div>
        <NoticeBoardCard
          viewAllHref="/lecturer/announcements"
          palette={LECTURER_PALETTE}
          notices={announcements.map((notice) => ({
            id: notice.id,
            title: notice.title,
            publishedAt: notice.publishedAt,
            moduleCode: notice.module?.code ?? null,
          }))}
        />
      </div>
    </div>
  );
}
