import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const providers: Provider[] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    authorize: async (rawCredentials) => {
      const parsed = credentialsSchema.safeParse(rawCredentials);
      if (!parsed.success) return null;
      const { email, password } = parsed.data;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.isActive || !user.passwordHash) return null;

      const passwordValid = await verifyPassword(password, user.passwordHash);
      if (!passwordValid) return null;

      return {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        role: user.role,
      };
    },
  }),
];

// Google's provider throws a config error on every request (breaking Credentials
// sign-in too) if AUTH_GOOGLE_ID/SECRET are missing — only register it once real
// values are set.
if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(Google({}));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    signIn: async ({ user, account }) => {
      if (account?.provider !== "google") return true;
      if (!user.email) return false;

      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      if (!existing) {
        const [firstName, ...rest] = (user.name ?? "Student").split(" ");
        await prisma.user.create({
          data: {
            email: user.email,
            passwordHash: null,
            firstName: firstName || "Student",
            lastName: rest.join(" ") || "-",
            role: "STUDENT",
            isActive: true,
          },
        });
        return true;
      }

      return existing.isActive;
    },
    jwt: async ({ token, user, account }) => {
      if (user) {
        if (account?.provider === "google" && user.email) {
          const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } else {
          token.id = user.id as string;
          token.role = user.role;
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
});
