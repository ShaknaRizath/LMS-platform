import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "@/auth.config";
import type { Role } from "@/generated/prisma/enums";

// Built from the Prisma-free auth.config so this bundle (which runs on every
// request) never pulls in the generated Prisma client — see auth.config.ts.
const { auth } = NextAuth(authConfig);

const ROLE_HOME: Record<Role, string> = {
  SUPER_ADMIN: "/admin",
  CAMPUS_ADMIN: "/admin",
  ACADEMIC_DIRECTOR: "/academic",
  PROGRAM_COORDINATOR: "/coordinator",
  LECTURER: "/lecturer",
  FINANCE: "/finance",
  MARKETING_OFFICER: "/marketing",
  EXAMINATION_UNIT: "/examinations",
  LIBRARY_OFFICER: "/library",
  HR_OFFICER: "/hr",
  STUDENT: "/student",
};

const PATH_PREFIX_ROLES: Array<{ prefix: string; roles: Role[] }> = [
  { prefix: "/admin", roles: ["SUPER_ADMIN", "CAMPUS_ADMIN"] },
  { prefix: "/academic", roles: ["ACADEMIC_DIRECTOR"] },
  { prefix: "/coordinator", roles: ["PROGRAM_COORDINATOR"] },
  { prefix: "/lecturer", roles: ["LECTURER"] },
  { prefix: "/student", roles: ["STUDENT"] },
  { prefix: "/finance", roles: ["FINANCE"] },
  { prefix: "/marketing", roles: ["MARKETING_OFFICER"] },
  { prefix: "/examinations", roles: ["EXAMINATION_UNIT"] },
  { prefix: "/library", roles: ["LIBRARY_OFFICER"] },
  { prefix: "/hr", roles: ["HR_OFFICER"] },
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
