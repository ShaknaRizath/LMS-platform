import "server-only";
import type { Role } from "@/generated/prisma/enums";

export function resolveAllowedFolderPrefix(role: Role, userId: string): string {
  return role === "STUDENT" ? `receipts/${userId}` : "content-files";
}
