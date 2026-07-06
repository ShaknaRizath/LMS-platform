import { Badge } from "@/components/ui/badge";
import type { RegistrationStatus } from "@/generated/prisma/enums";

const STATUS_VARIANTS: Record<RegistrationStatus, { label: string; variant: "secondary" | "outline" | "destructive" }> = {
  PAYMENT_PENDING: { label: "Payment Pending", variant: "outline" },
  PENDING: { label: "Pending Approval", variant: "secondary" },
  APPROVED: { label: "Approved", variant: "secondary" },
  REJECTED: { label: "Rejected", variant: "destructive" },
};

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  const { label, variant } = STATUS_VARIANTS[status];
  return <Badge variant={variant}>{label}</Badge>;
}
