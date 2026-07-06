import "server-only";
import { prisma } from "@/lib/db/prisma";
import { ConsoleAdapter } from "@/lib/notifications/console.adapter";
import { ResendAdapter } from "@/lib/notifications/resend.adapter";
import type { EmailMessage, NotificationAdapter } from "@/lib/notifications/notification.interface";

const adapter: NotificationAdapter = process.env.RESEND_API_KEY
  ? new ResendAdapter(process.env.RESEND_API_KEY)
  : new ConsoleAdapter();

const isStubbed = adapter instanceof ConsoleAdapter;

/** Sends an email via the configured adapter and records it in NotificationLog. */
export async function sendNotificationEmail(
  type: string,
  message: EmailMessage,
  recipientUserId?: string
) {
  const result = await adapter.sendEmail(message);

  await prisma.notificationLog.create({
    data: {
      type,
      recipientEmail: message.to,
      recipientUserId,
      subject: message.subject,
      status: isStubbed ? "STUBBED" : result.success ? "SENT" : "FAILED",
      error: result.error,
    },
  });

  return result;
}
