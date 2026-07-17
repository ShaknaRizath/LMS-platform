"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClassSessionForm } from "@/components/scheduling/class-session-form";
import { updateClassSession } from "@/lib/actions/scheduling/class-session.actions";
import type { DayOfWeek } from "@/generated/prisma/client";

export type EditableClassSession = {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
  lecturerId: string;
  updatedAt: Date;
};

export function EditClassSessionDialog({
  session,
  moduleId,
  lecturers,
}: {
  session: EditableClassSession;
  moduleId: string;
  lecturers: { id: string; firstName: string; lastName: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="ghost" size="sm">Edit</Button>} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit class session</DialogTitle>
        </DialogHeader>
        <ClassSessionForm
          key={session.updatedAt.getTime()}
          lecturers={lecturers}
          action={updateClassSession.bind(null, session.id, moduleId)}
          defaultValues={{
            dayOfWeek: session.dayOfWeek,
            startTime: session.startTime,
            endTime: session.endTime,
            room: session.room,
            lecturerId: session.lecturerId,
          }}
          submitLabel="Save changes"
          pendingLabel="Saving..."
        />
      </DialogContent>
    </Dialog>
  );
}
