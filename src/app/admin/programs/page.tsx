import Link from "next/link";
import { Plus } from "lucide-react";
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
import { GraduationCap } from "lucide-react";

export default async function ProgramsPage() {
  const programs = await prisma.program.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { modules: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Programs</h1>
          <p className="text-muted-foreground">Degree programs offered by the campus.</p>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/programs/new" />}>
          <Plus />
          New program
        </Button>
      </div>

      {programs.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <GraduationCap />
            </EmptyMedia>
            <EmptyTitle>No programs yet</EmptyTitle>
            <EmptyDescription>Create your first degree program to get started.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map((program) => (
                <TableRow key={program.id} className="cursor-pointer">
                  <TableCell>
                    <Link href={`/admin/programs/${program.id}`} className="font-medium hover:underline">
                      {program.name}
                    </Link>
                  </TableCell>
                  <TableCell>{program.code}</TableCell>
                  <TableCell>{program.durationYears} yrs</TableCell>
                  <TableCell>{program._count.modules}</TableCell>
                  <TableCell>
                    <Badge variant={program.isActive ? "secondary" : "outline"}>
                      {program.isActive ? "Active" : "Inactive"}
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
