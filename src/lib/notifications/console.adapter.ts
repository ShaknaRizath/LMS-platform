import type { EmailMessage, NotificationAdapter } from "@/lib/notifications/notification.interface";

/** Dev fallback used whenever RESEND_API_KEY is unset — logs instead of sending. */
export class ConsoleAdapter implements NotificationAdapter {
  async sendEmail(message: EmailMessage) {
    console.log(`[email:stub] to=${message.to} subject="${message.subject}"`);
    console.log(message.html);
    return { success: true };
  }
}
