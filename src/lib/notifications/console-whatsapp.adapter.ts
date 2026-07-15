import type { WhatsAppMessage, WhatsAppAdapter } from "@/lib/notifications/whatsapp.interface";

/**
 * Temporary stand-in until a real provider (e.g. Meta WhatsApp Cloud API) is wired up —
 * logs instead of sending. Not a production implementation; swap in a real
 * WhatsAppAdapter later without touching any call site (see the selection comment in
 * notifications/index.ts).
 */
export class ConsoleWhatsAppAdapter implements WhatsAppAdapter {
  async sendWhatsApp(message: WhatsAppMessage) {
    console.log(`[whatsapp:stub] to=${message.to}`);
    console.log(message.body);
    return { success: true };
  }
}
