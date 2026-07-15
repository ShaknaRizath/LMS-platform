export interface SmsMessage {
  to: string;
  body: string;
}

export interface SmsAdapter {
  sendSms(message: SmsMessage): Promise<{ success: boolean; error?: string }>;
}
