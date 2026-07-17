"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

export function ApplicationDetailsDialog({
  application,
}: {
  application: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    program: { name: string };
    statement: string | null;
    status: string;
    referenceCode: string;
    submittedAt: Date;
    reviewedBy: { firstName: string; lastName: string } | null;
    reviewedAt: Date | null;
    rejectionReason: string | null;
  };
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm">View</Button>} />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {application.firstName} {application.lastName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_VARIANT[application.status]}>{application.status}</Badge>
            <span className="font-mono text-xs text-muted-foreground">{application.referenceCode}</span>
          </div>

          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
            <dt className="text-muted-foreground">Email</dt>
            <dd>{application.email}</dd>
            <dt className="text-muted-foreground">Phone</dt>
            <dd>{application.phone ?? "—"}</dd>
            <dt className="text-muted-foreground">Program</dt>
            <dd>{application.program.name}</dd>
            <dt className="text-muted-foreground">Submitted</dt>
            <dd>{application.submittedAt.toLocaleString()}</dd>
            {application.reviewedBy && (
              <>
                <dt className="text-muted-foreground">Reviewed by</dt>
                <dd>
                  {application.reviewedBy.firstName} {application.reviewedBy.lastName}
                  {application.reviewedAt ? ` · ${application.reviewedAt.toLocaleString()}` : ""}
                </dd>
              </>
            )}
          </dl>

          <div>
            <p className="mb-1 font-medium text-foreground">Why they want to join</p>
            <p className="whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-3 text-muted-foreground">
              {application.statement || "No statement provided."}
            </p>
          </div>

          {application.status === "REJECTED" && application.rejectionReason && (
            <div>
              <p className="mb-1 font-medium text-foreground">Rejection reason</p>
              <p className="whitespace-pre-wrap rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-muted-foreground">
                {application.rejectionReason}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
