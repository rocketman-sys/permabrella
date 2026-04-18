import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">
            Community Q&amp;A
          </h1>
          <p className="mt-2 text-[var(--perm-text-secondary)]">
            Topics and threads will be loaded from the database after seeding.
          </p>
        </div>
        <Link
          href="/community/new"
          className="inline-flex rounded-lg bg-[var(--perm-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
        >
          New thread
        </Link>
      </div>
      <Card className="mt-8 border-dashed">
        <p className="text-sm text-[var(--perm-muted)]">
          Run <code className="rounded bg-[var(--perm-bg)] px-1">npm run db:push</code> and{" "}
          <code className="rounded bg-[var(--perm-bg)] px-1">npm run db:seed</code> to load topics.
        </p>
      </Card>
    </div>
  );
}
