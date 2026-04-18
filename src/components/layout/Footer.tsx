import Link from "next/link";
import { Suspense } from "react";
import { RegionFilter } from "./RegionFilter";
import { SITE_ORIGIN } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--perm-border)] bg-[var(--perm-card)]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-semibold text-[var(--perm-primary)]">PermaBrella</p>
          <p className="mt-2 text-sm text-[var(--perm-text-secondary)]">
            A community food security switchboard for the Northern Rivers — connecting
            growers, land, and local knowledge.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-[var(--perm-text)]">Explore</p>
          <ul className="mt-2 space-y-1 text-sm text-[var(--perm-text-secondary)]">
            <li>
              <Link href="/events" className="hover:text-[var(--perm-secondary)]">
                Events & workshops
              </Link>
            </li>
            <li>
              <Link
                href="/offerings"
                className="hover:text-[var(--perm-secondary)]"
              >
                Offerings & wants
              </Link>
            </li>
            <li>
              <Link
                href="/land-connect"
                className="hover:text-[var(--perm-secondary)]"
              >
                Land connect
              </Link>
            </li>
            <li>
              <Link
                href="/community"
                className="hover:text-[var(--perm-secondary)]"
              >
                Community Q&amp;A
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <label htmlFor="footer-region" className="text-sm font-medium text-[var(--perm-text)]">
            Region
          </label>
          <p className="mt-1 text-xs text-[var(--perm-muted)]">
            Filter lists and feeds by area (URL-based for now).
          </p>
          <div className="mt-2 max-w-xs">
            <Suspense fallback={<div className="h-10 rounded-lg bg-[var(--perm-bg)]" />}>
              <RegionFilter id="footer-region" />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--perm-border)] py-4 text-center text-xs text-[var(--perm-muted)]">
        <a
          href={SITE_ORIGIN}
          className="font-medium text-[var(--perm-secondary)] hover:underline"
          rel="noopener noreferrer"
        >
          permabrella.org
        </a>
        <span className="mx-2 text-[var(--perm-border)]">·</span>
        Built for the Northern Rivers food security network.
      </div>
    </footer>
  );
}
