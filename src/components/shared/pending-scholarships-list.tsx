import { ScholarshipDecisionActions } from "@/components/finance/scholarship-decision-actions";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { HandCoins } from "lucide-react";

export type PendingScholarship = {
  id: string;
  reason: string;
  student: {
    firstName: string;
    lastName: string;
    program: { name: string } | null;
  };
};

export function PendingScholarshipsList({ applications }: { applications: PendingScholarship[] }) {
  if (applications.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HandCoins />
          </EmptyMedia>
          <EmptyTitle>Nothing pending</EmptyTitle>
          <EmptyDescription>Student scholarship applications will appear here.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {applications.map((application) => (
        <div key={application.id} className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium">
            {application.student.firstName} {application.student.lastName}
            {application.student.program ? ` — ${application.student.program.name}` : ""}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{application.reason}</p>
          <div className="mt-3">
            <ScholarshipDecisionActions scholarshipId={application.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
