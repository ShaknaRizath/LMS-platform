"use server";

import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";

export async function markNotificationRead(key: string) {
  const user = await requireUser();

  await prisma.notificationRead.upsert({
    where: { userId_key: { userId: user.id, key } },
    update: {},
    create: { userId: user.id, key },
  });
}
