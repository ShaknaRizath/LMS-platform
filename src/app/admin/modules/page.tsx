import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default async function ModulesPage() {
  const modules = await prisma.module.findMany({
    orderBy: [{ academicYear: { name: "desc" } }, { code: "asc" }],
    include: {
      program: true,
      academicYear: true,
      semester: true,
      lecturerAssignments: { include: { lecturer: true } },
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Modules</h1>
          <p className="text-muted-foreground">Modules across all programs and semesters.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/modules/new" />}>
          <Plus />
          New module
        </Button>
      </div>

      {modules.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>No modules yet</EmptyTitle>
            <EmptyDescription>
              Create a program and academic year first, then add modules.
            </EmptyDescription>
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
                <TableHead>Lecturer</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module) => (
                <TableRow key={module.id}>
                  <TableCell>
                    <Link href={`/admin/modules/${module.id}`} className="font-medium hover:underline">
                      {module.code}
                    </Link>
                  </TableCell>
                  <TableCell>{module.title}</TableCell>
                  <TableCell>{module.program.name}</TableCell>
                  <TableCell>
                    {module.academicYear.name} — {module.semester.name}
                  </TableCell>
                  <TableCell>
                    {module.lecturerAssignments.length > 0
                      ? module.lecturerAssignments
                          .map((a) => `${a.lecturer.firstName} ${a.lecturer.lastName}`)
                          .join(", ")
                      : "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={module.isActive ? "secondary" : "outline"}>
                      {module.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
