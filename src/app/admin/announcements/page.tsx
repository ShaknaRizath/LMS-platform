import { prisma } from "@/lib/db/prisma";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { InstitutionAnnouncementForm } from "@/components/admin/institution-announcement-form";
import { deleteInstitutionAnnouncement } from "@/lib/actions/admin/announcement.actions";

export default async function AdminAnnouncementsPage() {
  const announcements = await prisma.announcement.findMany({
    where: { scope: "INSTITUTION" },
    orderBy: [{ isPinned: "desc" }, { publishedAt: "desc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Announcements</h1>
        <p className="text-muted-foreground">Institution-wide notices visible to everyone.</p>
      </div>

      <InstitutionAnnouncementForm />

      <div className="flex flex-col gap-3">
        {announcements.length === 0 && (
          <p className="text-sm text-muted-foreground">No institution-wide announcements yet.</p>
        )}
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {announcement.title}
                  {announcement.isPinned && <Badge variant="secondary">Pinned</Badge>}
                </CardTitle>
                <form action={deleteInstitutionAnnouncement.bind(null, announcement.id)}>
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
