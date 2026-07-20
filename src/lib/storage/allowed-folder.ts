import "server-only";
import type { Role } from "@/generated/prisma/enums";

export function resolveAllowedFolderPrefixes(role: Role, userId: string): string[] {
  const avatarPrefix = `avatars/${userId}`;
  return role === "STUDENT"
    ? [`receipts/${userId}`, `submissions/${userId}`, avatarPrefix]
    : ["content-files", avatarPrefix];
}
