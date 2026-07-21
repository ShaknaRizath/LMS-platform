"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { STAFF_ROLES } from "@/lib/validation/user.schema";

// Private per-user notes — every action scopes to the current user's own rows (via
// authorId: user.id in both the write and the where-clause), so there's no reviewer/decider
// side to check like every other staff.actions.ts file in this codebase.

export async function createNote(formData: FormData) {
  const user = await requireRole([...STAFF_ROLES]);

  const title = formData.get("title");
  const content = formData.get("content");
  if (typeof title !== "string" || title.trim().length === 0) return;

  await prisma.staffNote.create({
    data: {
      authorId: user.id,
      title: title.trim(),
      content: typeof content === "string" ? content.trim() : "",
    },
  });

  revalidatePath("/marketing");
}

export async function toggleNoteStar(noteId: string) {
  const user = await requireRole([...STAFF_ROLES]);

  const note = await prisma.staffNote.findUnique({ where: { id: noteId } });
  if (!note || note.authorId !== user.id) return;

  await prisma.staffNote.update({ where: { id: noteId }, data: { isStarred: !note.isStarred } });

  revalidatePath("/marketing");
}

export async function deleteNote(noteId: string) {
  const user = await requireRole([...STAFF_ROLES]);

  await prisma.staffNote.deleteMany({ where: { id: noteId, authorId: user.id } });

  revalidatePath("/marketing");
}
