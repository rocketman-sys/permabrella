"use client";

import { useEffect, useState } from "react";

/** Relative times tick each minute; badges/counts also update at their exact expiry. */
export function useActivityClock(initialNow: number, expiryTimes: number[]) {
  const [now, setNow] = useState(initialNow);
  useEffect(() => {
    const startedAt = performance.now();
    let timer: ReturnType<typeof setTimeout>;
    function tick() {
      clearTimeout(timer);
      // Keep the server's time base even when the device clock is incorrect.
      const current = initialNow + performance.now() - startedAt;
      setNow(current);
      const future = expiryTimes.filter((time) => time > current);
      if (future.length) timer = setTimeout(tick, Math.min(60_000, Math.min(...future) - current));
    }
    timer = setTimeout(tick, 0);
    window.addEventListener("focus", tick);
    return () => { clearTimeout(timer); window.removeEventListener("focus", tick); };
  }, [initialNow, expiryTimes]);
  return now;
}
