import type { PushAdapter, PushMessage, PushSubscriptionTarget } from "@/lib/notifications/push.interface";

/** Used only when VAPID_* env vars aren't set — logs instead of sending. */
export class ConsolePushAdapter implements PushAdapter {
  async sendPush(subscription: PushSubscriptionTarget, message: PushMessage) {
    console.log(`[push:stub] to subscription=${subscription.id}`);
    console.log(message.title, message.body);
    return { success: true };
  }
}
