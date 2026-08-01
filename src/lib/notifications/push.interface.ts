export interface PushMessage {
  title: string;
  body: string;
  url?: string;
}

export interface PushSubscriptionTarget {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushAdapter {
  sendPush(
    subscription: PushSubscriptionTarget,
    message: PushMessage
  ): Promise<{ success: boolean; error?: string; expired?: boolean }>;
}
