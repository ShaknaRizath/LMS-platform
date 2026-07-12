import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DetailSummary } from "@/components/admin/detail-summary";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function StudentProfilePage() {
  const student = await requireRole(["STUDENT"]);

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: student.id },
    include: { program: true },
  });

  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My profile</h1>
        <p className="text-muted-foreground">View and update your personal details.</p>
      </div>

      <Card className="max-w-xl">
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback className="bg-secondary text-secondary-foreground">
              {initials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{fullName}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <DetailSummary
            items={[
              { label: "First name", value: user.firstName },
              { label: "Last name", value: user.lastName },
              { label: "Email", value: user.email },
              { label: "Phone", value: user.phone },
              { label: "Program", value: user.program?.name },
            ]}
          />
          <Button nativeButton={false} render={<Link href="/student/profile/edit" />} className="self-start">
            Edit profile
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
