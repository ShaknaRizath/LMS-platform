import "server-only";
import { prisma } from "@/lib/db/prisma";
import { ConsoleAdapter } from "@/lib/notifications/console.adapter";
import { ResendAdapter } from "@/lib/notifications/resend.adapter";
import { ConsoleSmsAdapter } from "@/lib/notifications/console-sms.adapter";
import { ConsoleWhatsAppAdapter } from "@/lib/notifications/console-whatsapp.adapter";
import { WebPushAdapter } from "@/lib/notifications/webpush.adapter";
import { ConsolePushAdapter } from "@/lib/notifications/console-push.adapter";
import type { EmailMessage, NotificationAdapter } from "@/lib/notifications/notification.interface";
import type { SmsMessage, SmsAdapter } from "@/lib/notifications/sms.interface";
import type { WhatsAppMessage, WhatsAppAdapter } from "@/lib/notifications/whatsapp.interface";
import type { PushMessage, PushAdapter, PushSubscriptionTarget } from "@/lib/notifications/push.interface";

const adapter: NotificationAdapter = process.env.RESEND_API_KEY
  ? new ResendAdapter(process.env.RESEND_API_KEY)
  : new ConsoleAdapter();

const isStubbed = adapter instanceof ConsoleAdapter;

// Swap to a real provider later exactly like the email adapter above, e.g.:
//   const smsAdapter: SmsAdapter = process.env.TWILIO_ACCOUNT_SID
//     ? new TwilioSmsAdapter(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN!)
//     : new ConsoleSmsAdapter();
// No real adapter class exists yet, so this always resolves to the stub.
const smsAdapter: SmsAdapter = new ConsoleSmsAdapter();
const isSmsStubbed = smsAdapter instanceof ConsoleSmsAdapter;

// Same story as SMS above — swap in a real Meta WhatsApp Cloud API adapter later.
const whatsappAdapter: WhatsAppAdapter = new ConsoleWhatsAppAdapter();
const isWhatsAppStubbed = whatsappAdapter instanceof ConsoleWhatsAppAdapter;

// Push needs no external business account (just a self-generated VAPID key pair), so unlike
// SMS/WhatsApp this is real from day one once VAPID_* env vars are set.
const pushAdapter: PushAdapter = process.env.VAPID_PRIVATE_KEY ? new WebPushAdapter() : new ConsolePushAdapter();
const isPushStubbed = pushAdapter instanceof ConsolePushAdapter;

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
      channel: "EMAIL",
      recipient: message.to,
      recipientUserId,
      subject: message.subject,
      body: message.html,
      status: isStubbed ? "STUBBED" : result.success ? "SENT" : "FAILED",
      error: result.error,
    },
  });

  return result;
}

/** Sends an SMS via the configured adapter and records it in NotificationLog. */
export async function sendNotificationSms(
  type: string,
  message: SmsMessage,
  recipientUserId?: string
) {
  const result = await smsAdapter.sendSms(message);

  await prisma.notificationLog.create({
    data: {
      type,
      channel: "SMS",
      recipient: message.to,
      recipientUserId,
      body: message.body,
      status: isSmsStubbed ? "STUBBED" : result.success ? "SENT" : "FAILED",
      error: result.error,
    },
  });

  return result;
}

/** Sends a WhatsApp message via the configured adapter and records it in NotificationLog. */
export async function sendNotificationWhatsApp(
  type: string,
  message: WhatsAppMessage,
  recipientUserId?: string
) {
  const result = await whatsappAdapter.sendWhatsApp(message);

  await prisma.notificationLog.create({
    data: {
      type,
      channel: "WHATSAPP",
      recipient: message.to,
      recipientUserId,
      body: message.body,
      status: isWhatsAppStubbed ? "STUBBED" : result.success ? "SENT" : "FAILED",
      error: result.error,
    },
  });

  return result;
}

/**
 * Sends a push notification to one subscribed browser/device and records it in
 * NotificationLog. Deletes the PushSubscription row if the adapter reports it as expired
 * (push service returned 404/410) so future events stop trying that dead endpoint.
 */
export async function sendNotificationPush(
  type: string,
  subscription: PushSubscriptionTarget,
  message: PushMessage,
  recipientUserId?: string
) {
  const result = await pushAdapter.sendPush(subscription, message);

  if (result.expired) {
    await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {});
  }

  await prisma.notificationLog.create({
    data: {
      type,
      channel: "PUSH",
      recipient: subscription.endpoint,
      recipientUserId,
      body: message.body,
      status: isPushStubbed ? "STUBBED" : result.success ? "SENT" : "FAILED",
      error: result.error,
    },
  });

  return result;
}

/**
 * Fans a single event out to N users across every channel they have data for — email
 * always, SMS/WhatsApp only if the user has a phone number on file, push to every browser
 * they've subscribed from. The single call site for the Communication Module's trigger
 * events (announcements, grading).
 */
export async function notifyUsers(
  userIds: string[],
  type: string,
  content: { subject: string; body: string }
) {
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, phone: true, pushSubscriptions: true },
  });

  await Promise.all(
    users.flatMap((user) => {
      const tasks = [
        sendNotificationEmail(
          type,
          { to: user.email, subject: content.subject, html: `<p>${content.body}</p>` },
          user.id
        ),
      ];
      if (user.phone) {
        tasks.push(
          sendNotificationSms(type, { to: user.phone, body: `${content.subject}: ${content.body}` }, user.id)
        );
        tasks.push(
          sendNotificationWhatsApp(
            type,
            { to: user.phone, body: `*${content.subject}*\n${content.body}` },
            user.id
          )
        );
      }
      for (const subscription of user.pushSubscriptions) {
        tasks.push(
          sendNotificationPush(type, subscription, { title: content.subject, body: content.body }, user.id)
        );
      }
      return tasks;
    })
  );
}

/** Emails+ids of active users who review payments/registrations (admins and finance staff). */
export async function getPaymentReviewers() {
  return prisma.user.findMany({
    where: { role: { in: ["SUPER_ADMIN", "CAMPUS_ADMIN", "FINANCE"] }, isActive: true },
    select: { id: true, email: true },
  });
}
