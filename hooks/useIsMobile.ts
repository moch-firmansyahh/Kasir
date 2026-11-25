"use client";

import { useEffect, useState } from "react";

export type ViewportTier = "mobile" | "tablet" | "desktop";

const MOBILE_MAX_QUERY = "(max-width: 639px)";
const DESKTOP_MIN_QUERY = "(min-width: 1024px)";

/**
 * Returns true when viewport width is below 640px (mobile phone).
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_MAX_QUERY);
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return isMobile;
}

/**
 * Returns the responsive layout tier matching 06-DESIGN-SYSTEM.md breakpoints.
 */
export function useViewportTier(): ViewportTier {
  const [tier, setTier] = useState<ViewportTier>("desktop");

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_MAX_QUERY);
    const desktopQuery = window.matchMedia(DESKTOP_MIN_QUERY);

    const update = () => {
      if (mobileQuery.matches) {
        setTier("mobile");
      } else if (desktopQuery.matches) {
        setTier("desktop");
      } else {
        setTier("tablet");
      }
    };

    update();
    mobileQuery.addEventListener("change", update);
    desktopQuery.addEventListener("change", update);
    return () => {
      mobileQuery.removeEventListener("change", update);
      desktopQuery.removeEventListener("change", update);
    };
  }, []);

  return tier;
}
