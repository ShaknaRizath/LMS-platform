import Link from "next/link";
import { Plus, CalendarRange } from "lucide-react";
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

export default async function AcademicYearsPage() {
  const academicYears = await prisma.academicYear.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { semesters: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Academic Years</h1>
          <p className="text-muted-foreground">Academic years and their semesters.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/academic-years/new" />}>
          <Plus />
          New academic year
        </Button>
      </div>

      {academicYears.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarRange />
            </EmptyMedia>
            <EmptyTitle>No academic years yet</EmptyTitle>
            <EmptyDescription>Create one to start defining semesters and modules.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Semesters</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicYears.map((year) => (
                <TableRow key={year.id}>
                  <TableCell>
                    <Link href={`/admin/academic-years/${year.id}`} className="font-medium hover:underline">
                      {year.name}
                    </Link>
                  </TableCell>
                  <TableCell>{year.startDate.toLocaleDateString()}</TableCell>
                  <TableCell>{year.endDate.toLocaleDateString()}</TableCell>
                  <TableCell>{year._count.semesters}</TableCell>
                  <TableCell>
                    {year.isActive && <Badge variant="secondary">Active</Badge>}
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
