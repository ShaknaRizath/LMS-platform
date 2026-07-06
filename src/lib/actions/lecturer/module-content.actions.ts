"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertLecturerOwnsModule } from "@/lib/auth/ownership";
import { contentItemSchema } from "@/lib/validation/content-item.schema";
import type { ActionState } from "@/lib/actions/action-state";

function sanitizeIfRichText<T extends { type: string; richTextHtml?: string }>(data: T): T {
  if (data.type === "RICH_TEXT" && data.richTextHtml) {
    return { ...data, richTextHtml: DOMPurify.sanitize(data.richTextHtml) };
  }
  return data;
}

export async function createContentItem(
  weekId: string,
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  const parsed = contentItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const data = sanitizeIfRichText(parsed.data);

  const lastItem = await prisma.contentItem.findFirst({
    where: { weekId },
    orderBy: { orderIndex: "desc" },
  });

  await prisma.contentItem.create({
    data: {
      ...data,
      weekId,
      createdById: lecturer.id,
      orderIndex: (lastItem?.orderIndex ?? -1) + 1,
    },
  });

  revalidatePath(`/lecturer/modules/${moduleId}`);
  return undefined;
}

export async function updateContentItem(
  contentItemId: string,
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  const parsed = contentItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const data = sanitizeIfRichText(parsed.data);

  await prisma.contentItem.update({ where: { id: contentItemId }, data });

  revalidatePath(`/lecturer/modules/${moduleId}`);
  return undefined;
}

export async function deleteContentItem(contentItemId: string, moduleId: string) {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  await prisma.contentItem.delete({ where: { id: contentItemId } });

  revalidatePath(`/lecturer/modules/${moduleId}`);
}

export async function setContentItemStatus(
  contentItemId: string,
  moduleId: string,
  status: "DRAFT" | "PUBLISHED"
) {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  await prisma.contentItem.update({
    where: { id: contentItemId },
    data: { status, publishedAt: status === "PUBLISHED" ? new Date() : null },
  });

  revalidatePath(`/lecturer/modules/${moduleId}`);
}

export async function reorderContentItems(
  weekId: string,
  moduleId: string,
  orderedContentItemIds: string[]
) {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  await prisma.$transaction(
    orderedContentItemIds.map((id, index) =>
      prisma.contentItem.update({ where: { id }, data: { orderIndex: index } })
    )
  );

  revalidatePath(`/lecturer/modules/${moduleId}`);
}
