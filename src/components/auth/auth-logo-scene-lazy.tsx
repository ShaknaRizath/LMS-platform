"use client";

import dynamic from "next/dynamic";

export const AuthLogoSceneLazy = dynamic(
  () => import("@/components/auth/auth-logo-scene").then((mod) => mod.AuthLogoScene),
  { ssr: false }
);
