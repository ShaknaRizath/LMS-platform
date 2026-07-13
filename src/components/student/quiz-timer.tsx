"use client";

import { useEffect, useState } from "react";

export function QuizTimer({ deadline }: { deadline: Date }) {
  const [remainingMs, setRemainingMs] = useState(() => deadline.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingMs(deadline.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const expired = remainingMs <= 0;
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <p className={`text-sm font-medium ${expired ? "text-destructive" : "text-muted-foreground"}`}>
      {expired
        ? "Time's up — submit now, your answers so far will still be recorded."
        : `Time remaining: ${minutes}:${seconds.toString().padStart(2, "0")}`}
    </p>
  );
}
