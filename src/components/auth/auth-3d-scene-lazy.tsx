"use client";

import dynamic from "next/dynamic";

export const Auth3DSceneLazy = dynamic(
  () => import("@/components/auth/auth-3d-scene").then((mod) => mod.Auth3DScene),
  { ssr: false }
);
