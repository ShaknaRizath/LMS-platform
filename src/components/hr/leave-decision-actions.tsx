"use client";

import { decideLeaveRequest } from "@/lib/actions/staff/leave.actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function LeaveDecisionActions({ requestId }: { requestId: string }) {
  return (
    <form
      action={decideLeaveRequest.bind(null, requestId, "APPROVED")}
      className="flex flex-col gap-2 sm:flex-row sm:items-start"
    >
      <Textarea name="decisionNote" placeholder="Optional note" className="min-h-9 flex-1" />
      <div className="flex gap-2">
        <Button type="submit" size="sm">
          Approve
        </Button>
        <Button
          type="submit"
          formAction={decideLeaveRequest.bind(null, requestId, "REJECTED")}
          variant="destructive"
          size="sm"
        >
          Reject
        </Button>
      </div>
    </form>
  );
}
