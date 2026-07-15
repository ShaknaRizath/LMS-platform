export interface WhatsAppMessage {
  to: string;
  body: string;
}

export interface WhatsAppAdapter {
  sendWhatsApp(message: WhatsAppMessage): Promise<{ success: boolean; error?: string }>;
}
