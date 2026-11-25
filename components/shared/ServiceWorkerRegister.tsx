"use client";

import { useEffect } from "react";

/**
 * Registers the PWA Service Worker for offline app-shell & static asset caching.
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  return null;
}
