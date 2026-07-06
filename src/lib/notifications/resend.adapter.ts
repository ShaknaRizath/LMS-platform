import { Resend } from "resend";
import type { EmailMessage, NotificationAdapter } from "@/lib/notifications/notification.interface";

export class ResendAdapter implements NotificationAdapter {
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async sendEmail(message: EmailMessage) {
    const { error } = await this.client.emails.send({
      from: process.env.EMAIL_FROM ?? "CIMS Campus <no-reply@cims.edu>",
      to: message.to,
      subject: message.subject,
      html: message.html,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }
}
