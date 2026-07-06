import Link from "next/link";
import { BookOpen } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default async function LecturerModulesPage() {
  const lecturer = await requireRole(["LECTURER"]);

  const assignments = await prisma.lecturerModuleAssignment.findMany({
    where: { lecturerId: lecturer.id },
    include: {
      module: { include: { program: true, academicYear: true, semester: true } },
    },
    orderBy: { module: { code: "asc" } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Modules</h1>
        <p className="text-muted-foreground">Modules you&apos;re assigned to teach.</p>
      </div>

      {assignments.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen />
            </EmptyMedia>
            <EmptyTitle>No modules assigned yet</EmptyTitle>
            <EmptyDescription>
              An administrator needs to assign you to a module first.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assignments.map(({ module: mod }) => (
            <Link key={mod.id} href={`/lecturer/modules/${mod.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/40">
                <CardHeader>
                  <CardDescription>{mod.code}</CardDescription>
                  <CardTitle>{mod.title}</CardTitle>
                  <CardDescription>
                    {mod.program.name} · {mod.academicYear.name} · {mod.semester.name}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
