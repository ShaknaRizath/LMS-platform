import { signOut } from "@/auth";

// Reached only via requireRole/requireUser, when a signed session cookie's user no
// longer exists in the database (deleted account, or a dev database reset). proxy.ts's
// role check is JWT-only (no DB access there by design — see its own comment), so it
// can't detect this case; redirecting straight to /login without clearing the cookie
// would loop forever, since proxy.ts bounces any request to /login that still carries a
// role claim back to that role's home page, which immediately fails the same DB check
// again. Clearing the cookie here breaks that loop.
export async function GET() {
  await signOut({ redirectTo: "/login" });
}
