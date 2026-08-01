import webpush, { WebPushError } from "web-push";
import type { PushAdapter, PushMessage, PushSubscriptionTarget } from "@/lib/notifications/push.interface";

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

/**
 * Real adapter — unlike SMS/WhatsApp, push needs no external business account, so this is
 * live from day one whenever VAPID_* env vars are set (see notifications/index.ts's
 * selection logic, same conditional-on-env-var pattern as ResendAdapter/ConsoleAdapter).
 */
export class WebPushAdapter implements PushAdapter {
  async sendPush(subscription: PushSubscriptionTarget, message: PushMessage) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify(message)
      );
      return { success: true };
    } catch (error) {
      if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
        return { success: false, error: "Subscription expired", expired: true };
      }
      return { success: false, error: error instanceof Error ? error.message : "Unknown push error" };
    }
  }
}
