"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SemesterForm } from "@/components/admin/semester-form";
import { DeleteConfirmButton } from "@/components/admin/delete-confirm-button";
import { updateSemester, deleteSemester } from "@/lib/actions/admin/academic-year.actions";

export type EditableSemester = {
  id: string;
  name: string;
  semesterNumber: number;
  startDate: Date;
  endDate: Date;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
};

export function EditSemesterDialog({
  semester,
  academicYearId,
  deleteWarning,
}: {
  semester: EditableSemester;
  academicYearId: string;
  deleteWarning: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="sm">Edit</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {semester.name}</DialogTitle>
        </DialogHeader>
        <SemesterForm
          action={updateSemester.bind(null, semester.id, academicYearId)}
          defaultValues={{
            name: semester.name,
            semesterNumber: semester.semesterNumber,
            startDate: semester.startDate,
            endDate: semester.endDate,
            registrationOpensAt: semester.registrationOpensAt,
            registrationClosesAt: semester.registrationClosesAt,
          }}
          submitLabel="Save changes"
        />
        <DeleteConfirmButton
          action={deleteSemester.bind(null, semester.id, academicYearId)}
          title={`Delete ${semester.name}?`}
          description={deleteWarning}
        />
      </DialogContent>
    </Dialog>
  );
}
