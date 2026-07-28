import { prisma } from "@/lib/db/prisma";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { ApplicationForm } from "@/components/admissions/application-form";

// Public form — its program list must reflect whatever admins have configured right now, not
// whatever existed at the last deploy. Without this, Next.js prerenders the page once at build
// time and serves that frozen HTML forever (confirmed live: a program added after deploy never
// appeared until the next build).
export const dynamic = "force-dynamic";

export default async function ApplyPage() {
  const programs = await prisma.program.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <AuthSplitLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-foreground">Apply to CIMS Campus</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Submit your application below. We&apos;ll review it and email you with a decision.
        </p>
      </div>
      <ApplicationForm programs={programs} />
    </AuthSplitLayout>
  );
}
