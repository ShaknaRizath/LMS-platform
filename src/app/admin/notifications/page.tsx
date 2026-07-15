import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/rbac";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const CHANNELS = ["EMAIL", "SMS", "WHATSAPP"] as const;

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive"> = {
  SENT: "default",
  STUBBED: "secondary",
  FAILED: "destructive",
};

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ channel?: string }>;
}) {
  await requireRole(["SUPER_ADMIN", "CAMPUS_ADMIN"]);
  const { channel } = await searchParams;
  const activeChannel = CHANNELS.includes(channel as (typeof CHANNELS)[number]) ? channel : undefined;

  const logs = await prisma.notificationLog.findMany({
    where: activeChannel ? { channel: activeChannel as (typeof CHANNELS)[number] } : undefined,
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
        <p className="text-muted-foreground">
          Outbound notifications across every channel — email, SMS, and WhatsApp. Most recent 100.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/admin/notifications"
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            !activeChannel ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
          )}
        >
          All
        </Link>
        {CHANNELS.map((c) => (
          <Link
            key={c}
            href={`/admin/notifications?channel=${c}`}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              activeChannel === c ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground"
            )}
          >
            {c}
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Channel</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.type}</TableCell>
                <TableCell>
                  <Badge variant="outline">{log.channel}</Badge>
                </TableCell>
                <TableCell>{log.recipient}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[log.status] ?? "outline"}>{log.status}</Badge>
                </TableCell>
                <TableCell>{log.sentAt.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
