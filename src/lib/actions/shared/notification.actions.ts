"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/rbac";

export async function markNotificationRead(key: string) {
  const user = await requireUser();

  await prisma.notificationRead.upsert({
    where: { userId_key: { userId: user.id, key } },
    update: {},
    create: { userId: user.id, key },
  });

  // The bell's unread state is computed in every role's layout.tsx, not a single page,
  // so a targeted revalidatePath can't target just the affected route.
  revalidatePath("/", "layout");
}
