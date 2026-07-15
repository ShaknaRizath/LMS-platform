import Link from "next/link";
import { CalendarClock } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default async function CoordinatorTimetablesPage() {
  const modules = await prisma.module.findMany({
    where: { isActive: true },
    orderBy: [{ academicYear: { name: "desc" } }, { code: "asc" }],
    include: {
      program: true,
      academicYear: true,
      semester: true,
      _count: { select: { classSessions: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Timetables</h1>
        <p className="text-muted-foreground">Manage the weekly class schedule for each active module.</p>
      </div>

      {modules.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarClock />
            </EmptyMedia>
            <EmptyTitle>No active modules</EmptyTitle>
            <EmptyDescription>Modules will appear here once they&apos;re created and active.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell>
                    <Link
                      href={`/coordinator/timetables/${module.id}`}
                      className="font-medium hover:underline"
                    >
                      {module.code}
                    </Link>
                  </TableCell>
                  <TableCell>{module.title}</TableCell>
                  <TableCell>{module.program.name}</TableCell>
                  <TableCell>
                    {module.academicYear.name} — {module.semester.name}
                  </TableCell>
                  <TableCell>{module._count.classSessions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
