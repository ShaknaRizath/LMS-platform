"use server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";

export async function markNotificationRead(key: string) {
  const student = await requireRole(["STUDENT"]);

  await prisma.notificationRead.upsert({
    where: { userId_key: { userId: student.id, key } },
    update: {},
    create: { userId: student.id, key },
  });
}
