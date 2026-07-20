import "server-only";
import type { Role } from "@/generated/prisma/enums";

export function resolveAllowedFolderPrefixes(role: Role, userId: string): string[] {
  return role === "STUDENT"
    ? [`receipts/${userId}`, `submissions/${userId}`, `avatars/${userId}`]
    : ["content-files"];
}
