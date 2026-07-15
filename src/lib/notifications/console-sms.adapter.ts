import type { SmsMessage, SmsAdapter } from "@/lib/notifications/sms.interface";

/**
 * Temporary stand-in until a real provider (e.g. Twilio) is wired up — logs instead of
 * sending. Not a production implementation; swap in a real SmsAdapter later without
 * touching any call site (see the selection comment in notifications/index.ts).
 */
export class ConsoleSmsAdapter implements SmsAdapter {
  async sendSms(message: SmsMessage) {
    console.log(`[sms:stub] to=${message.to}`);
    console.log(message.body);
    return { success: true };
  }
}
