import "server-only";
import { prisma } from "@/lib/db/prisma";

export type ModuleAssignmentStatus = "Needs lecturer" | "Needs timetable" | "OK";

export type ModuleAssignmentStatusRow = {
  moduleId: string;
  code: string;
  title: string;
  lecturerNames: string;
  sessionCount: number;
  status: ModuleAssignmentStatus;
};

// Priority order for surfacing the modules needing action first on the coordinator's
// dashboard preview — an unassigned module blocks scheduling entirely, so it outranks a
// module that has a lecturer but no timetable yet.
const STATUS_RANK: Record<ModuleAssignmentStatus, number> = {
  "Needs lecturer": 0,
  "Needs timetable": 1,
  OK: 2,
};

export async function getModuleAssignmentStatus(): Promise<ModuleAssignmentStatusRow[]> {
  const modules = await prisma.module.findMany({
    where: { isActive: true },
    include: {
      lecturerAssignments: { include: { lecturer: true } },
      _count: { select: { classSessions: true } },
    },
    orderBy: { code: "asc" },
  });

  return modules
    .map((module_) => {
      const lecturerNames = module_.lecturerAssignments
        .map((assignment) => `${assignment.lecturer.firstName} ${assignment.lecturer.lastName}`)
        .join(", ");
      const sessionCount = module_._count.classSessions;
      const status: ModuleAssignmentStatus =
        module_.lecturerAssignments.length === 0
          ? "Needs lecturer"
          : sessionCount === 0
            ? "Needs timetable"
            : "OK";

      return {
        moduleId: module_.id,
        code: module_.code,
        title: module_.title,
        lecturerNames: lecturerNames || "Unassigned",
        sessionCount,
        status,
      };
    })
    .sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status]);
}
