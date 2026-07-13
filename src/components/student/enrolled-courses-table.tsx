import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { STUDENT_PALETTE } from "@/components/student/palette";
import type { EnrollmentStatus } from "@/generated/prisma/enums";

export type EnrolledCourseRow = {
  id: string;
  moduleId: string;
  code: string;
  title: string;
  lessons: number;
  credits: number | null;
  instructor: string | null;
  status: EnrollmentStatus;
};

const STATUS_STYLE: Record<EnrollmentStatus, { label: string; bg: string; fg: string }> = {
  ACTIVE: { label: "In Progress", bg: STUDENT_PALETTE[0].bg, fg: STUDENT_PALETTE[0].fg },
  COMPLETED: { label: "Completed", bg: STUDENT_PALETTE[2].bg, fg: STUDENT_PALETTE[2].fg },
  WITHDRAWN: { label: "Withdrawn", bg: "#EDEDF0", fg: "#6B6F80" },
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function EnrolledCoursesTable({ courses }: { courses: EnrolledCourseRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrolled Courses</CardTitle>
      </CardHeader>
      <div className="px-(--card-spacing) pb-(--card-spacing)">
        {courses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active enrollments yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Name</TableHead>
                <TableHead>Lessons</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => {
                const status = STATUS_STYLE[course.status];
                return (
                  <TableRow key={course.id}>
                    <TableCell>
                      <Link href={`/student/modules/${course.moduleId}`} className="hover:underline">
                        <p className="font-medium text-foreground">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.code}</p>
                      </Link>
                    </TableCell>
                    <TableCell>{course.lessons}</TableCell>
                    <TableCell>{course.credits ?? "—"}</TableCell>
                    <TableCell>
                      {course.instructor ? (
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            <AvatarFallback>{initials(course.instructor)}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{course.instructor}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{ backgroundColor: status.bg, color: status.fg }}
                      >
                        {status.label}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
}
