import { requireRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { ModuleGradeLockToggle } from "@/components/examinations/module-grade-lock-toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function MarksLockingPage() {
  await requireRole(["EXAMINATION_UNIT"]);

  const modules = await prisma.module.findMany({
    where: { isActive: true },
    include: { program: true, semester: true, gradeLock: true },
    orderBy: [{ semester: { startDate: "desc" } }, { code: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Marks Locking</h1>
        <p className="text-muted-foreground">
          Lock a module's marks once grading is final — lecturers can no longer edit grades until
          you unlock it again.
        </p>
      </div>

      {modules.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active modules.</p>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {modules.map((module_) => {
                const locked = module_.gradeLock !== null && module_.gradeLock.unlockedAt === null;
                return (
                  <TableRow key={module_.id}>
                    <TableCell>{module_.code}</TableCell>
                    <TableCell>{module_.title}</TableCell>
                    <TableCell>{module_.program.name}</TableCell>
                    <TableCell>{module_.semester.name}</TableCell>
                    <TableCell>
                      <Badge variant={locked ? "destructive" : "secondary"}>
                        {locked ? "Locked" : "Open"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <ModuleGradeLockToggle moduleId={module_.id} locked={locked} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
