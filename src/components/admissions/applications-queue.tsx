import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { RejectApplicationDialog } from "@/components/admissions/reject-application-dialog";
import { ApproveApplicationButton } from "@/components/admissions/approve-application-button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Inbox } from "lucide-react";

const STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

export function ApplicationsQueue({
  basePath,
  activeStatus,
  applications,
}: {
  basePath: string;
  activeStatus?: string;
  applications: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    program: { name: string };
    status: string;
    submittedAt: Date;
  }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link
          href={basePath}
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            !activeStatus ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
          )}
        >
          All
        </Link>
        {STATUSES.map((status) => (
          <Link
            key={status}
            href={`${basePath}?status=${status}`}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              activeStatus === status
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground"
            )}
          >
            {status}
          </Link>
        ))}
      </div>

      {applications.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Inbox />
            </EmptyMedia>
            <EmptyTitle>No applications</EmptyTitle>
            <EmptyDescription>Applications submitted at /apply will show up here.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell>
                    {application.firstName} {application.lastName}
                  </TableCell>
                  <TableCell>{application.email}</TableCell>
                  <TableCell>{application.program.name}</TableCell>
                  <TableCell>{application.submittedAt.toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[application.status]}>{application.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {application.status === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <ApproveApplicationButton applicationId={application.id} />
                        <RejectApplicationDialog applicationId={application.id} />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
