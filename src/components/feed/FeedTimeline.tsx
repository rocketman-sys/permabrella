import { Card } from "@/components/ui/Card";

export function FeedTimeline() {
  return (
    <section aria-labelledby="feed-heading">
      <h2 id="feed-heading" className="sr-only">
        Recent activity
      </h2>
      <Card className="border-dashed">
        <p className="text-sm text-[var(--perm-text-secondary)]">
          Recent activity from events, offerings, land listings, and community threads
          will show here as panels go live.
        </p>
      </Card>
    </section>
  );
}
