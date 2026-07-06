import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/admin/user-form";
import { updateUser, setUserActive } from "@/lib/actions/admin/user.actions";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const [user, programs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.program.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  if (!user) notFound();

  const toggleAction = setUserActive.bind(null, user.id, !user.isActive);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={user.isActive ? "secondary" : "outline"}>
            {user.isActive ? "Active" : "Deactivated"}
          </Badge>
          <form action={toggleAction}>
            <Button type="submit" variant="outline">
              {user.isActive ? "Deactivate" : "Reactivate"}
            </Button>
          </form>
        </div>
      </div>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Edit user</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm
            action={updateUser.bind(null, user.id)}
            mode="edit"
            programs={programs}
            defaultValues={user}
            submitLabel="Save changes"
          />
        </CardContent>
      </Card>
    </div>
  );
}
