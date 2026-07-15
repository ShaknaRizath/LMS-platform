import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { computeStudentAcademicRecord } from "@/lib/grades/gpa";
import { RegistrationStatusBadge } from "@/components/shared/registration-status-badge";
import { DashboardHeaderCard } from "@/components/student/dashboard-header-card";
import { AssignmentsCard, type TodoItem } from "@/components/student/assignments-card";
import { ProgressCard } from "@/components/student/progress-card";
import { MiniCalendarCard } from "@/components/student/mini-calendar-card";
import { EnrolledCoursesTable } from "@/components/student/enrolled-courses-table";
import { NoticeBoardCard } from "@/components/student/notice-board-card";
import { ActivityCard, type ActivityItem } from "@/components/student/activity-card";

export default async function StudentDashboardPage() {
  const student = await requireRole(["STUDENT"]);

  const [latestRegistration, activeEnrollments, calendarEvents] = await Promise.all([
    prisma.semesterRegistration.findFirst({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      include: { paymentRecords: { orderBy: { uploadedAt: "desc" }, take: 1 } },
    }),
    prisma.enrollment.findMany({
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
    }),
    prisma.calendarEvent.findMany({ orderBy: { startDate: "asc" } }),
  ]);

  const activeModuleIds = activeEnrollments
    .filter((enrollment) => enrollment.status === "ACTIVE")
    .map((enrollment) => enrollment.moduleId);

  const now = new Date();

  const [
    upcomingAssignments,
    allAssignments,
    submittedCount,
    notices,
    recentContent,
    recentGraded,
    openQuizzes,
    attendanceRecords,
  ] = await Promise.all([
      prisma.contentItem.findMany({
        where: {
          isAssignment: true,
          status: "PUBLISHED",
          week: { moduleId: { in: activeModuleIds } },
          dueDate: { gte: new Date() },
        },
        include: { week: { include: { module: true } } },
        orderBy: { dueDate: "asc" },
        take: 3,
      }),
      prisma.contentItem.count({
        where: { isAssignment: true, status: "PUBLISHED", week: { moduleId: { in: activeModuleIds } } },
      }),
      prisma.submission.count({
        where: { studentId: student.id, contentItem: { isAssignment: true, week: { moduleId: { in: activeModuleIds } } } },
      }),
      prisma.announcement.findMany({
        where: {
          OR: [
            { scope: "INSTITUTION" },
            { module: { enrollments: { some: { studentId: student.id, status: "ACTIVE" } } } },
          ],
        },
        include: { module: true },
        orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
        take: 4,
      }),
      prisma.contentItem.findMany({
        where: { status: "PUBLISHED", week: { moduleId: { in: activeModuleIds } } },
        include: { week: { include: { module: true } } },
        orderBy: { publishedAt: "desc" },
        take: 4,
      }),
      prisma.submission.findMany({
        where: { studentId: student.id, gradedAt: { not: null } },
        include: { contentItem: { include: { week: { include: { module: true } } } } },
        orderBy: { gradedAt: "desc" },
        take: 4,
      }),
      prisma.quiz.findMany({
        where: {
          moduleId: { in: activeModuleIds },
          OR: [
            { status: "PUBLISHED" },
            { status: "SCHEDULED", availableFrom: { lte: now }, availableUntil: { gte: now } },
          ],
        },
        include: { module: true, attempts: { where: { studentId: student.id } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.attendanceRecord.findMany({
        where: { studentId: student.id },
        select: { status: true },
      }),
    ]);

  const academicRecord = await computeStudentAcademicRecord(student.id);

  const upcomingQuizzes = openQuizzes.filter((quiz) => quiz.attempts.length < quiz.maxAttempts).slice(0, 3);

  const attendedCount = attendanceRecords.filter((r) => r.status === "PRESENT" || r.status === "LATE").length;
  const attendanceRate =
    attendanceRecords.length > 0 ? `${Math.round((attendedCount / attendanceRecords.length) * 100)}%` : "—";

  const todoItems: TodoItem[] = [
    ...upcomingAssignments.map((item) => ({
      id: `assignment-${item.id}`,
      kind: "ASSIGNMENT" as const,
      title: item.title,
      subtitle: `${item.week.module.code} · Due ${item.dueDate!.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`,
      moduleId: item.week.moduleId,
    })),
    ...upcomingQuizzes.map((quiz) => ({
      id: `quiz-${quiz.id}`,
      kind: "QUIZ" as const,
      title: quiz.title,
      subtitle: `${quiz.module.code} · ${quiz.kind === "EXAM" ? "Exam" : "Quiz"}`,
      moduleId: quiz.moduleId,
    })),
  ].slice(0, 5);

  const activity: ActivityItem[] = [
    ...recentContent.map((item) => ({
      id: `content-${item.id}`,
      label: item.title,
      detail: `New content in ${item.week.module.code}`,
      date: item.publishedAt ?? item.createdAt,
      kind: "content" as const,
    })),
    ...recentGraded.map((submission) => ({
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
        title="Student Dashboard"
        subtitle="Your enrolled modules, notices, and registration status."
        stats={[
          {
            label: "Registration status",
            value: latestRegistration ? (
              <RegistrationStatusBadge status={latestRegistration.status} />
            ) : (
              "Not registered"
            ),
          },
          { label: "Enrolled modules", value: activeModuleIds.length },
          {
            label: "Payment status",
            value: latestRegistration?.paymentRecords[0]?.verificationStatus ?? "—",
          },
          { label: "Attendance rate", value: attendanceRate },
          {
            label: "Cumulative GPA",
            value: academicRecord.cumulativeGpa !== null ? academicRecord.cumulativeGpa.toFixed(2) : "—",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <AssignmentsCard items={todoItems} />
        <ProgressCard submitted={submittedCount} total={allAssignments} />
        <MiniCalendarCard events={calendarEvents} />
        <ActivityCard
          className="lg:row-span-2"
          studentName={student.name ?? student.email ?? "Student"}
          activity={activity}
        />

        <div className="lg:col-span-2">
          <EnrolledCoursesTable
            courses={activeEnrollments.map((enrollment) => ({
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
        <NoticeBoardCard
          notices={notices.map((notice) => ({
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
