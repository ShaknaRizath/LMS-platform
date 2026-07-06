import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db/prisma";
import { UserForm } from "@/components/admin/user-form";
import { createUser } from "@/lib/actions/admin/user.actions";

export default async function NewUserPage() {
  const programs = await prisma.program.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">New user</h1>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm action={createUser} mode="create" programs={programs} submitLabel="Create user" />
        </CardContent>
      </Card>
    </div>
  );
}
