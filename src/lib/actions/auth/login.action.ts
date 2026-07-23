"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string; redirectTo?: string } | undefined;

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl");
  const redirectTo = typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/";

  try {
    // redirect: false + a client-side router.push/refresh (see login-form.tsx) instead of
    // letting signIn() redirect server-side — Auth.js's own redirect leaves the destination
    // page's client components (e.g. the dashboard shell's usePathname-based footer) reading
    // a stale route until a manual refresh; an explicit client navigation fetches it fresh.
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }

  return { redirectTo };
}
