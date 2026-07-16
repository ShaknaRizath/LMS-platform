"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { SCHOLARSHIP_DISCOUNT_TYPE_OPTIONS } from "@/lib/validation/scholarship.schema";

const SCHOLARSHIP_DECIDE_ROLES = ["FINANCE", "SUPER_ADMIN", "CAMPUS_ADMIN"] as const;

export async function decideScholarship(scholarshipId: string, decision: "APPROVED" | "REJECTED", formData: FormData) {
  const user = await requireRole([...SCHOLARSHIP_DECIDE_ROLES]);

  const decisionNoteRaw = formData.get("decisionNote");
  const decisionNote = typeof decisionNoteRaw === "string" && decisionNoteRaw.length > 0 ? decisionNoteRaw : null;

  if (decision === "APPROVED") {
    const discountTypeRaw = formData.get("discountType");
    const discountValueRaw = formData.get("discountValue");
    const discountType = typeof discountTypeRaw === "string" ? discountTypeRaw : "";
    const discountValue = typeof discountValueRaw === "string" ? Number(discountValueRaw) : NaN;

    if (!SCHOLARSHIP_DISCOUNT_TYPE_OPTIONS.includes(discountType as (typeof SCHOLARSHIP_DISCOUNT_TYPE_OPTIONS)[number])) {
      throw new Error("Select a discount type before approving.");
    }
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      throw new Error("Enter a positive discount value before approving.");
    }

    await prisma.scholarship.update({
      where: { id: scholarshipId },
      data: {
        status: "APPROVED",
        discountType: discountType as (typeof SCHOLARSHIP_DISCOUNT_TYPE_OPTIONS)[number],
        discountValue,
        decidedById: user.id,
        decidedAt: new Date(),
        decisionNote,
      },
    });
  } else {
    await prisma.scholarship.update({
      where: { id: scholarshipId },
      data: { status: "REJECTED", decidedById: user.id, decidedAt: new Date(), decisionNote },
    });
  }

  revalidatePath("/finance/scholarships");
  revalidatePath("/finance");
  revalidatePath("/student/scholarships");
  revalidatePath("/student/payments");
}
