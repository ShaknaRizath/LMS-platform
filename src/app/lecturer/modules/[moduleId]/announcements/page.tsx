import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModuleAnnouncementForm } from "@/components/lecturer/module-announcement-form";
import {
  createModuleAnnouncement,
  deleteModuleAnnouncement,
} from "@/lib/actions/lecturer/announcement.actions";

export default async function LecturerModuleAnnouncementsPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const lecturer = await requireRole(["LECTURER"]);

  const assignment = await prisma.lecturerModuleAssignment.findUnique({
    where: { lecturerId_moduleId: { lecturerId: lecturer.id, moduleId } },
  });
  if (!assignment) notFound();

  const announcements = await prisma.announcement.findMany({
    where: { moduleId },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-foreground">Module announcements</h1>

      <ModuleAnnouncementForm action={createModuleAnnouncement.bind(null, moduleId)} />

      <div className="flex flex-col gap-3">
        {announcements.length === 0 && (
          <p className="text-sm text-muted-foreground">No announcements posted yet.</p>
        )}
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {announcement.title}
                  {announcement.isPinned && <Badge variant="secondary">Pinned</Badge>}
                </CardTitle>
                <form action={deleteModuleAnnouncement.bind(null, announcement.id, moduleId)}>
                  <Button type="submit" variant="ghost" size="sm">
                    Delete
                  </Button>
                </form>
              </div>
              <CardDescription>{announcement.publishedAt.toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">{announcement.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
