"use client";

import { useMemo } from "react";
import type { RecentThreadRow } from "@/lib/community/service";
import { ACTIVITY_WINDOW_MS, recentlyActive } from "@/lib/community/activity";
import { ThreadCard } from "./ThreadCard";
import { useActivityClock } from "./useActivityClock";

export function RecentlyActiveThreads({ rows, initialNow }: { rows: RecentThreadRow[]; initialNow: number }) {
  const expiries = useMemo(() => rows.flatMap((row) => row.activity.recentReplyTimes.map((time) => time + ACTIVITY_WINDOW_MS)), [rows]);
  const now = useActivityClock(initialNow, expiries);
  const active = recentlyActive(rows, now);
  if (!active.length) return null;
  return <section className="mt-8" aria-labelledby="recently-active-heading">
    <h2 id="recently-active-heading" className="text-xl font-semibold text-[var(--perm-primary)]">Recently active</h2>
    <p className="mt-2 text-sm text-[var(--perm-text-secondary)]">Public replies in the past 7 days, latest first.</p>
    <ul className="mt-4 space-y-3">
      {active.map((row) => <li key={row.thread.id}><ThreadCard row={row} topicSlug={row.topicSlug} topicName={row.topicName} now={now} recent /></li>)}
    </ul>
  </section>;
}
