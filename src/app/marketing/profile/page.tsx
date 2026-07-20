import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { ProfileViewCard } from "@/components/shared/profile-view-card";

export default async function MarketingOfficerProfilePage() {
  const staff = await requireRole(["MARKETING_OFFICER"]);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: staff.id } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My profile</h1>
        <p className="text-muted-foreground">View and update your personal details.</p>
      </div>

      <ProfileViewCard
        user={user}
        editHref="/marketing/profile/edit"
        extraItems={[
          { label: "Job title", value: user.jobTitle },
          { label: "Department", value: user.department },
        ]}
      />
    </div>
  );
}
