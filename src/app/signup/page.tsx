import { prisma } from "@/lib/db/prisma";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage() {
  const programs = await prisma.program.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <AuthSplitLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Get Started Now</h1>
      </div>
      <SignupForm programs={programs} />
    </AuthSplitLayout>
  );
}
