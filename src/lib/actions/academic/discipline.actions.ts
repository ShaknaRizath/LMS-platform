"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { DISCIPLINE_OUTCOME_OPTIONS } from "@/lib/validation/discipline-case.schema";

const DISCIPLINE_RESOLVE_ROLES = ["ACADEMIC_DIRECTOR", "SUPER_ADMIN", "CAMPUS_ADMIN"] as const;

export async function resolveDisciplineCase(caseId: string, formData: FormData) {
  const user = await requireRole([...DISCIPLINE_RESOLVE_ROLES]);

  const outcomeRaw = formData.get("outcome");
  const outcome = typeof outcomeRaw === "string" ? outcomeRaw : "";
  if (!DISCIPLINE_OUTCOME_OPTIONS.includes(outcome as (typeof DISCIPLINE_OUTCOME_OPTIONS)[number])) {
    throw new Error("Select an outcome before resolving.");
  }

  const resolutionNoteRaw = formData.get("resolutionNote");
  const resolutionNote =
    typeof resolutionNoteRaw === "string" && resolutionNoteRaw.length > 0 ? resolutionNoteRaw : null;

  const disciplineCase = await prisma.disciplineCase.update({
    where: { id: caseId },
    data: {
      status: "RESOLVED",
      outcome: outcome as (typeof DISCIPLINE_OUTCOME_OPTIONS)[number],
      resolvedById: user.id,
      resolvedAt: new Date(),
      resolutionNote,
    },
  });

  revalidatePath("/academic/discipline");
  revalidatePath("/academic");
  revalidatePath(`/coordinator/students/${disciplineCase.studentId}`);
}
