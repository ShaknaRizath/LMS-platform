import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BasicProfileForm } from "@/components/shared/basic-profile-form";

export default async function AcademicDirectorEditProfilePage() {
  const director = await requireRole(["ACADEMIC_DIRECTOR"]);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: director.id } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Edit profile</h1>
        <p className="text-muted-foreground">Update your personal details.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
        </CardHeader>
        <CardContent>
          <BasicProfileForm
            userId={user.id}
            viewHref="/academic/profile"
            formKey={user.updatedAt.getTime()}
            defaultValues={{
              firstName: user.firstName,
              lastName: user.lastName,
              phone: user.phone,
              avatarUrl: user.avatarUrl,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
