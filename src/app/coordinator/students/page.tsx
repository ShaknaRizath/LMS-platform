import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function CoordinatorStudentsPage() {
  await requireRole(["PROGRAM_COORDINATOR"]);

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { program: true },
    orderBy: { firstName: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Students</h1>
        <p className="text-muted-foreground">Browse students and file discipline cases when needed.</p>
      </div>

      <div className="flex flex-col gap-3">
        {students.map((student) => (
          <Link key={student.id} href={`/coordinator/students/${student.id}`}>
            <Card className="transition-colors hover:bg-muted/40">
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle>
                      {student.firstName} {student.lastName}
                    </CardTitle>
                    <CardDescription>
                      {student.email} {student.program ? `· ${student.program.name}` : ""}
                    </CardDescription>
                  </div>
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
