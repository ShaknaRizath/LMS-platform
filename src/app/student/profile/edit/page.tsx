import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/student/profile-form";

export default async function StudentEditProfilePage() {
  const student = await requireRole(["STUDENT"]);

  const user = await prisma.user.findUniqueOrThrow({ where: { id: student.id } });

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
          <ProfileForm
            defaultValues={{ firstName: user.firstName, lastName: user.lastName, phone: user.phone }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
