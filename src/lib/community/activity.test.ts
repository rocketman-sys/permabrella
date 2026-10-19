import assert from "node:assert/strict";
import test from "node:test";
import { ACTIVITY_WINDOW_MS, isNewUnanswered, recentlyActive, recentReplyTimes, relativeReplyTime, type ReplyActivity } from "./activity";

const now = Date.parse("2026-10-19T00:00:00Z");
const cutoff = now - ACTIVITY_WINDOW_MS;
const activity = (times: number[], total = times.length): ReplyActivity => ({ totalReplyCount: total, lastReplyAt: times.length ? new Date(Math.max(...times)) : null, recentReplyTimes: times });
const row = (id: string, times: number[]) => ({ thread: { id }, activity: activity(times) });

test("seven-day reply boundary is exclusive, present included and future excluded", () => {
  assert.deepEqual(recentReplyTimes(activity([cutoff - 1, cutoff, cutoff + 1, now, now + 1]), now), [cutoff + 1, now]);
});
test("no replies, stale replies and stale cached totals do not produce activity", () => {
  assert.deepEqual(recentlyActive([], now), []);
  assert.deepEqual(recentlyActive([{ thread: { id: "unanswered" }, activity: activity([], 99) }, row("old", [cutoff])], now), []);
});
test("a single genuine reply produces one highlighted thread", () => {
  assert.deepEqual(recentlyActive([row("only", [now - 1000])], now).map((x) => x.thread.id), ["only"]);
});
test("at most three threads sorted by latest reply with stable ties; source list unchanged", () => {
  const rows = [row("a", [now - 9000]), row("c", [now - 1000]), row("b", [now - 1000]), row("d", [now - 4000]), row("e", [])];
  assert.deepEqual(recentlyActive(rows, now).map((x) => x.thread.id), ["b", "c", "d"]);
  assert.deepEqual(rows.map((x) => x.thread.id), ["a", "c", "b", "d", "e"]);
});
test("counts decrease as individual replies expire; final expiry removes highlight", () => {
  const source = activity([cutoff + 1, now - 1000]);
  assert.equal(recentReplyTimes(source, now).length, 2);
  assert.equal(recentReplyTimes(source, now + 1).length, 1);
  assert.deepEqual(recentlyActive([{ thread: { id: "thread" }, activity: source }], now - 1000 + ACTIVITY_WINDOW_MS), []);
});
test("New is only for unanswered posts younger than seven days, never future posts", () => {
  assert.equal(isNewUnanswered(cutoff + 1, 0, now), true);
  assert.equal(isNewUnanswered(cutoff, 0, now), false);
  assert.equal(isNewUnanswered(now + 1, 0, now), false);
  assert.equal(isNewUnanswered(now, 1, now), false);
});
test("relative reply time has clear minute, hour and day labels", () => {
  assert.equal(relativeReplyTime(now - 999, now), "just now");
  assert.equal(relativeReplyTime(now - 60_000, now), "1 minute ago");
  assert.equal(relativeReplyTime(now - 120_000, now), "2 minutes ago");
  assert.equal(relativeReplyTime(now - 3_600_000, now), "1 hour ago");
  assert.equal(relativeReplyTime(now - 172_800_000, now), "2 days ago");
});
