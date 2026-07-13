"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { updateModuleAnnouncement } from "@/lib/actions/lecturer/announcement.actions";
import { Button } from "@/components/ui/button";
import { ModuleAnnouncementForm } from "@/components/lecturer/module-announcement-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function EditAnnouncementDialog({
  announcementId,
  moduleId,
  defaultValues,
}: {
  announcementId: string;
  moduleId: string;
  defaultValues: { title: string; body: string; isPinned: boolean };
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="ghost" size="sm">
            <Pencil />
            Edit
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit announcement</DialogTitle>
        </DialogHeader>
        <ModuleAnnouncementForm
          action={updateModuleAnnouncement.bind(null, announcementId, moduleId)}
          defaultValues={defaultValues}
          submitLabel="Save changes"
          pendingLabel="Saving..."
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
