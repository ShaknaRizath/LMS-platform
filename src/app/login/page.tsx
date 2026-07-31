import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <AuthSplitLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Welcome back!</h1>
        <p className="mt-1 text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>
      <LoginForm callbackUrl={callbackUrl} />
    </AuthSplitLayout>
  );
}
