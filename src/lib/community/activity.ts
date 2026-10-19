export const ACTIVITY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
export const RECENT_THREAD_LIMIT = 3;

export type ReplyActivity = {
  totalReplyCount: number;
  lastReplyAt: Date | null;
  recentReplyTimes: number[];
};

export function recentReplyTimes(activity: ReplyActivity, now: number): number[] {
  return activity.recentReplyTimes.filter((time) => time > now - ACTIVITY_WINDOW_MS && time <= now);
}

export function recentlyActive<T extends { thread: { id: string }; activity: ReplyActivity }>(rows: T[], now: number): T[] {
  return rows
    .map((row) => ({ row, latest: Math.max(...recentReplyTimes(row.activity, now)) }))
    .filter(({ latest }) => Number.isFinite(latest))
    .sort((a, b) => b.latest - a.latest || a.row.thread.id.localeCompare(b.row.thread.id))
    .slice(0, RECENT_THREAD_LIMIT)
    .map(({ row }) => row);
}

export function isNewUnanswered(createdAt: number, replyCount: number, now: number): boolean {
  return replyCount === 0 && createdAt <= now && createdAt > now - ACTIVITY_WINDOW_MS;
}

export function relativeReplyTime(time: number, now: number): string {
  const minutes = Math.floor(Math.max(0, now - time) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}
