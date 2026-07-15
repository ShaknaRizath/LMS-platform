import {
  resolveRange,
  getAcademicPerformanceSummary,
  getGradeDistribution,
  getQuizScoreTrend,
  getEngagementSummary,
  getDiscussionActivity,
  getTopModulesByDiscussionActivity,
  getAttendanceSummary,
  getAttendanceTrend,
  getModulesByAbsenteeism,
  getCommunicationSummary,
  getNotificationVolume,
  getNotificationStatusBreakdown,
  getCertificatesTotal,
  getCertificatesOverTime,
  getTopModulesByCertificates,
  getFinanceSummary,
} from "@/lib/analytics/queries";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TimeSeriesChart } from "@/components/analytics/time-series-chart";
import { DistributionBarChart } from "@/components/analytics/distribution-bar-chart";
import { BreakdownPieChart } from "@/components/analytics/breakdown-pie-chart";
import { DateRangeForm } from "@/components/analytics/date-range-form";

const NOTIFICATION_STATUS_LABELS: Record<string, string> = {
  SENT: "Sent",
  STUBBED: "Stubbed (dev)",
  FAILED: "Failed",
};

const NOTIFICATION_STATUS_COLORS: Record<string, string> = {
  SENT: "var(--chart-4)",
  STUBBED: "var(--chart-3)",
  FAILED: "var(--destructive)",
};

export async function AnalyticsDashboard({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const params = await searchParams;
  const range = resolveRange(params);

  // Sequential, not one big Promise.all — each of these 15 calls already fires its own
  // internal Promise.all (2-3 queries), so running all 15 concurrently fans out to well
  // over connection_limit's worth of simultaneous connections and intermittently fails
  // with P1017 ConnectionClosed. Confirmed live during the Finance batch's verification
  // pass. Same fix as the gradebook/GPA fan-out bug from the Admissions batch.
  const academicSummary = await getAcademicPerformanceSummary(range);
  const gradeDistribution = await getGradeDistribution(range);
  const quizScoreTrend = await getQuizScoreTrend(range);
  const engagementSummary = await getEngagementSummary(range);
  const discussionActivity = await getDiscussionActivity(range);
  const topModulesByDiscussion = await getTopModulesByDiscussionActivity(range);
  const attendanceSummary = await getAttendanceSummary(range);
  const attendanceTrend = await getAttendanceTrend(range);
  const modulesByAbsenteeism = await getModulesByAbsenteeism(range);
  const communicationSummary = await getCommunicationSummary(range);
  const notificationVolume = await getNotificationVolume(range);
  const notificationStatusBreakdown = await getNotificationStatusBreakdown(range);
  const certificatesTotal = await getCertificatesTotal(range);
  const certificatesOverTime = await getCertificatesOverTime(range);
  const topModulesByCertificates = await getTopModulesByCertificates(range);

  // Fetched separately, not folded into the Promise.all above — that batch already fans out
  // to well over connection_limit's worth of concurrent queries once each getXSummary's own
  // internal Promise.all is counted; adding a 16th entry here would only make that worse.
  const financeSummary = await getFinanceSummary(range);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">
            {range.from.toLocaleDateString()} – {range.to.toLocaleDateString()}
          </p>
        </div>
        <DateRangeForm from={range.from} to={range.to} />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Academic performance</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Average grade"
            value={academicSummary.averageGrade != null ? academicSummary.averageGrade.toFixed(1) : "—"}
          />
          <StatCard
            label="Pass rate"
            value={academicSummary.passRate != null ? `${academicSummary.passRate.toFixed(0)}%` : "—"}
            hint="Graded submissions ≥ 50"
          />
          <StatCard
            label="Average quiz score"
            value={
              academicSummary.averageQuizScore != null ? `${academicSummary.averageQuizScore.toFixed(0)}%` : "—"
            }
          />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Grade distribution</CardTitle>
              <CardDescription>Graded assignment submissions in range</CardDescription>
            </CardHeader>
            {gradeDistribution.some((bucket) => bucket.count > 0) ? (
              <DistributionBarChart data={gradeDistribution} xKey="bucket" />
            ) : (
              <p className="px-6 pb-6 text-sm text-muted-foreground">No graded submissions in this range.</p>
            )}
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quiz score trend</CardTitle>
              <CardDescription>Average score per day</CardDescription>
            </CardHeader>
            {quizScoreTrend.length > 0 ? (
              <TimeSeriesChart
                data={quizScoreTrend}
                series={[{ key: "averageScore", label: "Average score", color: "var(--chart-1)" }]}
              />
            ) : (
              <p className="px-6 pb-6 text-sm text-muted-foreground">No quiz attempts in this range.</p>
            )}
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Engagement</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Discussion threads" value={engagementSummary.threadCount} />
          <StatCard label="Discussion posts" value={engagementSummary.postCount} />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Discussion activity</CardTitle>
              <CardDescription>Threads and posts per day</CardDescription>
            </CardHeader>
            {discussionActivity.length > 0 ? (
              <TimeSeriesChart
                data={discussionActivity}
                series={[
                  { key: "threads", label: "Threads", color: "var(--chart-1)" },
                  { key: "posts", label: "Posts", color: "var(--chart-2)" },
                ]}
              />
            ) : (
              <p className="px-6 pb-6 text-sm text-muted-foreground">No discussion activity in this range.</p>
            )}
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Most active modules</CardTitle>
              <CardDescription>By post count</CardDescription>
            </CardHeader>
            {topModulesByDiscussion.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Posts</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topModulesByDiscussion.map((item) => (
                    <TableRow key={item.moduleCode}>
                      <TableCell>{item.moduleCode}</TableCell>
                      <TableCell>{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="px-6 pb-6 text-sm text-muted-foreground">No activity in this range.</p>
            )}
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Attendance</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            label="Attendance rate"
            value={attendanceSummary.attendanceRate !== null ? `${Math.round(attendanceSummary.attendanceRate)}%` : "—"}
          />
          <StatCard label="Classes recorded" value={attendanceSummary.total} />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Attendance rate over time</CardTitle>
              <CardDescription>Per day</CardDescription>
            </CardHeader>
            {attendanceTrend.length > 0 ? (
              <TimeSeriesChart
                data={attendanceTrend}
                series={[{ key: "attendanceRate", label: "Attendance rate", color: "var(--chart-1)" }]}
              />
            ) : (
              <p className="px-6 pb-6 text-sm text-muted-foreground">No attendance recorded in this range.</p>
            )}
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Modules with most absences</CardTitle>
              <CardDescription>By absent count</CardDescription>
            </CardHeader>
            {modulesByAbsenteeism.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Absences</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modulesByAbsenteeism.map((item) => (
                    <TableRow key={item.moduleCode}>
                      <TableCell>{item.moduleCode}</TableCell>
                      <TableCell>{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="px-6 pb-6 text-sm text-muted-foreground">No absences recorded in this range.</p>
            )}
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Communication delivery</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard label="Notifications sent" value={communicationSummary.totalSent} />
          <StatCard
            label="Delivery success rate"
            value={
              communicationSummary.successRate != null ? `${communicationSummary.successRate.toFixed(0)}%` : "—"
            }
          />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Notification volume</CardTitle>
              <CardDescription>By channel, per day</CardDescription>
            </CardHeader>
            {notificationVolume.length > 0 ? (
              <TimeSeriesChart
                data={notificationVolume}
                series={[
                  { key: "email", label: "Email", color: "var(--chart-1)" },
                  { key: "sms", label: "SMS", color: "var(--chart-2)" },
                  { key: "whatsapp", label: "WhatsApp", color: "var(--chart-4)" },
                ]}
              />
            ) : (
              <p className="px-6 pb-6 text-sm text-muted-foreground">No notifications in this range.</p>
            )}
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Delivery status</CardTitle>
              <CardDescription>All channels</CardDescription>
            </CardHeader>
            {notificationStatusBreakdown.length > 0 ? (
              <BreakdownPieChart
                data={notificationStatusBreakdown}
                labels={NOTIFICATION_STATUS_LABELS}
                colors={NOTIFICATION_STATUS_COLORS}
              />
            ) : (
              <p className="px-6 pb-6 text-sm text-muted-foreground">No notifications in this range.</p>
            )}
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Certificates &amp; completion</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
          <StatCard label="Certificates issued" value={certificatesTotal} />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Certificates over time</CardTitle>
              <CardDescription>Per day</CardDescription>
            </CardHeader>
            {certificatesOverTime.length > 0 ? (
              <TimeSeriesChart
                data={certificatesOverTime}
                series={[{ key: "count", label: "Certificates", color: "var(--chart-4)" }]}
              />
            ) : (
              <p className="px-6 pb-6 text-sm text-muted-foreground">No certificates issued in this range.</p>
            )}
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Top modules</CardTitle>
              <CardDescription>By certificates issued</CardDescription>
            </CardHeader>
            {topModulesByCertificates.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Module</TableHead>
                    <TableHead>Certificates</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topModulesByCertificates.map((item) => (
                    <TableRow key={item.moduleCode}>
                      <TableCell>{item.moduleCode}</TableCell>
                      <TableCell>{item.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="px-6 pb-6 text-sm text-muted-foreground">No certificates issued in this range.</p>
            )}
          </Card>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-foreground">Finance</h2>
        <p className="text-sm text-muted-foreground">
          Current standing across all registrations — not scoped to the date range above, since
          an outstanding balance is a snapshot, not something that accrues per day.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard
            label="Collection rate"
            value={financeSummary.collectionRate !== null ? `${Math.round(financeSummary.collectionRate)}%` : "—"}
          />
          <StatCard label="Outstanding balance" value={`LKR ${financeSummary.totalOutstanding.toLocaleString()}`} />
        </div>
      </section>
    </div>
  );
}
