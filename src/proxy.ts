import { NextResponse } from "next/server";
import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/enums";

const ROLE_HOME: Record<Role, string> = {
  SUPER_ADMIN: "/admin",
  ADMIN: "/admin",
  LECTURER: "/lecturer",
  FINANCE: "/finance",
  REGISTRAR: "/registrar",
  STUDENT: "/student",
};

const PATH_PREFIX_ROLES: Array<{ prefix: string; roles: Role[] }> = [
  { prefix: "/admin", roles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/lecturer", roles: ["LECTURER"] },
  { prefix: "/student", roles: ["STUDENT"] },
  { prefix: "/finance", roles: ["FINANCE"] },
  { prefix: "/registrar", roles: ["REGISTRAR"] },
];

// Optimistic, JWT-only checks — no DB access here (Proxy runs on every
// request, including prefetches). Authoritative re-checks (e.g. isActive)
// happen in each role's layout via requireRole().
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  const matchedSection = PATH_PREFIX_ROLES.find(({ prefix }) =>
    pathname.startsWith(prefix)
  );

  if (matchedSection) {
    if (!role) {
      const loginUrl = new URL("/login", req.nextUrl);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (!matchedSection.roles.includes(role)) {
      return NextResponse.redirect(new URL("/unauthorized", req.nextUrl));
    }
  }

  if ((pathname === "/login" || pathname === "/signup" || pathname === "/") && role) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
