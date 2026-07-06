import Link from "next/link";
import { Megaphone } from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";

export default async function LecturerAnnouncementsPage() {
  const lecturer = await requireRole(["LECTURER"]);

  const announcements = await prisma.announcement.findMany({
    where: {
      OR: [
        { scope: "INSTITUTION" },
        { module: { lecturerAssignments: { some: { lecturerId: lecturer.id } } } },
      ],
    },
    include: { module: true },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Announcements</h1>

      {announcements.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Megaphone />
            </EmptyMedia>
            <EmptyTitle>No announcements yet</EmptyTitle>
            <EmptyDescription>Post one from a module page.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {announcement.title}
                  {announcement.isPinned && <Badge variant="secondary">Pinned</Badge>}
                </CardTitle>
                <CardDescription>
                  {announcement.module ? (
                    <Link href={`/lecturer/modules/${announcement.moduleId}`} className="hover:underline">
                      {announcement.module.code}
                    </Link>
                  ) : (
                    "Institution-wide"
                  )}{" "}
                  · {announcement.publishedAt.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{announcement.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
