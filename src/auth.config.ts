import type { NextAuthConfig } from "next-auth";

// Edge/Proxy-safe config: no providers, no Prisma/bcrypt imports. Proxy.ts
// builds its own lightweight `auth()` from this so the JWT-only role check
// running on every request never pulls the Prisma client into its bundle.
export default {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    session: ({ session, token }) => {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
