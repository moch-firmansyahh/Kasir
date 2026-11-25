"use client";

import { useEffect, useState } from "react";

/**
 * Keeps the kitchen screen awake using the Screen Wake Lock API when supported.
 * Re-acquires the lock automatically when the tab returns to visibility.
 */
export function useWakeLock(enabled: boolean = true) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !("wakeLock" in navigator)) {
      return;
    }

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    async function requestLock() {
      try {
        const nextSentinel = await navigator.wakeLock.request("screen");
        if (cancelled) {
          await nextSentinel.release();
          return;
        }
        sentinel = nextSentinel;
        setActive(true);
        nextSentinel.addEventListener("release", () => {
          if (!cancelled) setActive(false);
        });
      } catch {
        if (!cancelled) setActive(false);
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible" && !sentinel) {
        void requestLock();
      }
    }

    void requestLock();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (sentinel) {
        void sentinel.release().catch(() => undefined);
        sentinel = null;
      }
      setActive(false);
    };
  }, [enabled]);

  return active;
}
