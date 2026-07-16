"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { STAFF_ROLES } from "@/lib/validation/user.schema";
import { leaveRequestSchema } from "@/lib/validation/leave-request.schema";
import type { ActionState } from "@/lib/actions/action-state";

const LEAVE_DECIDE_ROLES = ["HR_OFFICER", "SUPER_ADMIN", "CAMPUS_ADMIN"] as const;

export async function requestLeave(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole(STAFF_ROLES);

  const parsed = leaveRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.staffLeaveRequest.create({ data: { ...parsed.data, staffId: user.id } });

  revalidatePath("/staff/leave");
  revalidatePath("/hr/leave");
  return undefined;
}

export async function decideLeaveRequest(requestId: string, decision: "APPROVED" | "REJECTED", formData: FormData) {
  const user = await requireRole([...LEAVE_DECIDE_ROLES]);

  const decisionNoteRaw = formData.get("decisionNote");
  const decisionNote = typeof decisionNoteRaw === "string" && decisionNoteRaw.length > 0 ? decisionNoteRaw : null;

  const request = await prisma.staffLeaveRequest.update({
    where: { id: requestId },
    data: { status: decision, decidedById: user.id, decidedAt: new Date(), decisionNote },
  });

  revalidatePath("/hr/leave");
  revalidatePath("/staff/leave");
  revalidatePath(`/hr/staff/${request.staffId}`);
}
