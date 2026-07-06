export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export interface NotificationAdapter {
  sendEmail(message: EmailMessage): Promise<{ success: boolean; error?: string }>;
}
