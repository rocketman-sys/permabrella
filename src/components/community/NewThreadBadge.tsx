"use client";

import { useMemo } from "react";
import { ACTIVITY_WINDOW_MS, isNewUnanswered } from "@/lib/community/activity";
import { useActivityClock } from "./useActivityClock";

export function NewThreadBadge({ createdAt, initialNow }: { createdAt: number; initialNow: number }) {
  const expiries = useMemo(() => [createdAt + ACTIVITY_WINDOW_MS], [createdAt]);
  const now = useActivityClock(initialNow, expiries);
  if (!isNewUnanswered(createdAt, 0, now)) return null;
  return <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-900" title="Posted in the past 7 days; no public replies yet">New<span className="sr-only"> — no replies yet</span></span>;
}
