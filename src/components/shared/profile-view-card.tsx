import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DetailSummary } from "@/components/admin/detail-summary";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// Shared "My profile" view card for every non-STUDENT role's self-service profile
// page — identity fields common to every role, plus whatever role-specific
// read-only context the caller passes via extraItems (e.g. job title, department).
export function ProfileViewCard({
  user,
  editHref,
  extraItems = [],
}: {
  user: { firstName: string; lastName: string; email: string; phone: string | null; avatarUrl: string | null };
  editHref: string;
  extraItems?: { label: string; value: React.ReactNode }[];
}) {
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <Card className="max-w-xl">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar size="lg">
          {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={fullName} />}
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
            ...extraItems,
          ]}
        />
        <Button nativeButton={false} render={<Link href={editHref} />} className="self-start">
          Edit profile
        </Button>
      </CardContent>
    </Card>
  );
}
