"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/actions/shared/push.actions";

type PushState = "unsupported" | "blocked" | "disabled" | "enabled";

// Deliberately not lucide's Bell/BellRing — those are the exact icons NotificationBell
// (rendered right next to this) already uses, making the two controls indistinguishable.
// A browser-window-with-bell glyph reads as "site notifications" instead of "message inbox".
function BrowserBellIcon({ crossedOut, className }: { crossedOut?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <circle cx="6" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="8.5" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="11" cy="6.5" r="0.6" fill="currentColor" stroke="none" />
      <line x1="2" y1="9" x2="22" y2="9" />
      <path d="M13.5 12.2a2 2 0 0 0-4 0c0 2.3-1 2.8-1 2.8h6s-1-.5-1-2.8" />
      <path d="M11 16.5a1 1 0 0 0 2 0" />
      {crossedOut && <line x1="3" y1="3" x2="21" y2="21" />}
    </svg>
  );
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

/** Shared header control (rendered once, in dashboard-shell.tsx) to opt in/out of browser push. */
export function PushNotificationToggle() {
  const [state, setState] = useState<PushState>("disabled");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        if (!cancelled) setState("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setState("blocked");
        return;
      }
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!cancelled) setState(subscription ? "enabled" : "disabled");
      } catch {
        if (!cancelled) setState("disabled");
      }
    }

    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enable() {
    setPending(true);
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "disabled");
        return;
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
      });
      await subscribeToPush(subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
      setState("enabled");
    } catch {
      setState("disabled");
    } finally {
      setPending(false);
    }
  }

  async function disable() {
    setPending(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await unsubscribeFromPush(subscription.endpoint);
        await subscription.unsubscribe();
      }
    } finally {
      setState("disabled");
      setPending(false);
    }
  }

  if (state === "unsupported") return null;

  const isOn = state === "enabled";
  const label = isOn
    ? "Push notifications on — click to turn off"
    : state === "blocked"
      ? "Push notifications blocked in browser settings"
      : "Enable push notifications";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            disabled={state === "blocked" || pending}
            onClick={isOn ? disable : enable}
          />
        }
      >
        <BrowserBellIcon crossedOut={!isOn} className="size-4" />
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
