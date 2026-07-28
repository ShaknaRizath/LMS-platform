import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import type { Role } from "@/generated/prisma/enums";

/**
 * Authoritative role check for use in role-scoped layouts. Re-reads `isActive`
 * from the DB (the JWT can't be revoked, so a deactivated user's session
 * cookie alone isn't enough to deny access) and redirects otherwise.
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isActive: true, programId: true },
  });

  // No matching user means a stale session (e.g. the account was deleted, or this JWT
  // predates a dev database reset). Redirecting straight to /login would loop forever —
  // proxy.ts's optimistic JWT-only check still sees this cookie's role claim and bounces
  // any /login visit straight back to that role's home page, which fails this same check
  // again. Route through clear-stale-session instead, which clears the cookie first.
  if (!user) {
    redirect("/api/auth/clear-stale-session");
  }

  if (!user.isActive || !allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return { ...session.user, role: user.role, programId: user.programId };
}

/**
 * Same authoritative checks as requireRole, minus the role restriction — for actions
 * any active, logged-in user may take regardless of role (e.g. marking one of their
 * own notification-bell items read).
 */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isActive: true, programId: true },
  });

  // See the matching comment in requireRole above — clears the stale cookie instead of
  // redirecting straight to /login, to avoid the proxy.ts login-bounce loop.
  if (!user) {
    redirect("/api/auth/clear-stale-session");
  }

  if (!user.isActive) {
    redirect("/unauthorized");
  }

  return { ...session.user, role: user.role, programId: user.programId };
}
