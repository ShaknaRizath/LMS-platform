import Link from "next/link";
import { Inbox } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import type { ApplicationStatus } from "@/generated/prisma/enums";

const STATUS_VARIANT: Record<ApplicationStatus, "default" | "secondary" | "destructive"> = {
  PENDING: "secondary",
  APPROVED: "default",
  REJECTED: "destructive",
};

export type ApplicationReviewRow = {
  id: string;
  applicantName: string;
  programName: string;
  submittedAt: Date;
  status: ApplicationStatus;
};

export function ApplicationReviewTable({ rows }: { rows: ApplicationReviewRow[] }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Application Review Queue</CardTitle>
            <CardDescription>Latest submitted applications</CardDescription>
          </div>
          <Link
            href="/marketing/applications"
            className="flex items-center text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            View All
          </Link>
        </div>
      </CardHeader>
      <div className="px-(--card-spacing) pb-(--card-spacing)">
        {rows.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle>No applications yet</EmptyTitle>
              <EmptyDescription>Applications submitted at /apply will show up here.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="max-w-36 truncate font-medium">{row.applicantName}</TableCell>
                  <TableCell className="max-w-40 truncate">{row.programName}</TableCell>
                  <TableCell>{row.submittedAt.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[row.status]}>{row.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </Card>
  );
}
