"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { assertLecturerOwnsModule, assertStudentEnrolledInModule } from "@/lib/auth/ownership";
import { threadSchema, postSchema } from "@/lib/validation/discussion.schema";
import type { ActionState } from "@/lib/actions/action-state";
import type { Role } from "@/generated/prisma/enums";

async function assertModuleMember(moduleId: string, user: { id: string; role: Role }) {
  if (user.role === "LECTURER") {
    await assertLecturerOwnsModule(moduleId, user.id);
  } else {
    await assertStudentEnrolledInModule(moduleId, user.id);
  }
}

function basePaths(moduleId: string) {
  return [`/lecturer/modules/${moduleId}/discussions`, `/student/modules/${moduleId}/discussions`];
}

export async function createThread(
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole(["LECTURER", "STUDENT"]);
  await assertModuleMember(moduleId, user);

  const parsed = threadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const thread = await prisma.discussionThread.create({
    data: { ...parsed.data, moduleId, authorId: user.id },
  });

  basePaths(moduleId).forEach((path) => revalidatePath(path));
  revalidatePath(`/lecturer/modules/${moduleId}/discussions/${thread.id}`);
  revalidatePath(`/student/modules/${moduleId}/discussions/${thread.id}`);
  return undefined;
}

export async function createPost(
  threadId: string,
  moduleId: string,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const user = await requireRole(["LECTURER", "STUDENT"]);
  await assertModuleMember(moduleId, user);

  const thread = await prisma.discussionThread.findUniqueOrThrow({ where: { id: threadId } });
  if (thread.isLocked) {
    return { error: "This thread is locked and no longer accepting replies." };
  }

  const parsed = postSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  await prisma.discussionPost.create({
    data: { ...parsed.data, threadId, authorId: user.id },
  });

  revalidatePath(`/lecturer/modules/${moduleId}/discussions/${threadId}`);
  revalidatePath(`/student/modules/${moduleId}/discussions/${threadId}`);
  return undefined;
}

export async function deletePost(postId: string, threadId: string, moduleId: string) {
  const user = await requireRole(["LECTURER", "STUDENT"]);
  await assertModuleMember(moduleId, user);

  const post = await prisma.discussionPost.findUniqueOrThrow({ where: { id: postId } });
  if (post.authorId !== user.id && user.role !== "LECTURER") {
    throw new Error("You can only delete your own posts.");
  }

  await prisma.discussionPost.delete({ where: { id: postId } });

  revalidatePath(`/lecturer/modules/${moduleId}/discussions/${threadId}`);
  revalidatePath(`/student/modules/${moduleId}/discussions/${threadId}`);
}

export async function pinThread(threadId: string, moduleId: string, isPinned: boolean) {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  await prisma.discussionThread.update({ where: { id: threadId }, data: { isPinned } });

  basePaths(moduleId).forEach((path) => revalidatePath(path));
}

export async function lockThread(threadId: string, moduleId: string, isLocked: boolean) {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  await prisma.discussionThread.update({ where: { id: threadId }, data: { isLocked } });

  revalidatePath(`/lecturer/modules/${moduleId}/discussions/${threadId}`);
  revalidatePath(`/student/modules/${moduleId}/discussions/${threadId}`);
}

export async function deleteThread(threadId: string, moduleId: string) {
  const lecturer = await requireRole(["LECTURER"]);
  await assertLecturerOwnsModule(moduleId, lecturer.id);

  await prisma.discussionThread.delete({ where: { id: threadId } });

  basePaths(moduleId).forEach((path) => revalidatePath(path));
}
