import { Auth3DSceneLazy } from "@/components/auth/auth-3d-scene-lazy";

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh w-full lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-6 py-16 sm:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
      <div className="relative hidden overflow-hidden bg-white lg:block">
        <Auth3DSceneLazy />
      </div>
    </div>
  );
}
