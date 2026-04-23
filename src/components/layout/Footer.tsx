import Link from "next/link";
import { Suspense } from "react";
import { RegionFilter } from "./RegionFilter";
import { SITE_ORIGIN } from "@/lib/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--perm-border)] bg-[var(--perm-card)]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="text-lg font-semibold text-[var(--perm-primary)] md:text-base">
            PermaBrella
          </p>
          <p className="mt-2 text-base leading-relaxed text-[var(--perm-text-secondary)] md:text-sm">
            A community food security switchboard for the Northern Rivers — connecting
            growers, land, and local knowledge.
          </p>
        </div>
        <div>
          <p className="text-base font-medium text-[var(--perm-text)] md:text-sm">Explore</p>
          <ul className="mt-2 space-y-1.5 text-base text-[var(--perm-text-secondary)] md:text-sm md:space-y-1">
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
                Offerings, Wants &amp; Exchange
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
              <Link href="/grants" className="hover:text-[var(--perm-secondary)]">
                Community grants
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
          <label
            htmlFor="footer-region"
            className="text-base font-medium text-[var(--perm-text)] md:text-sm"
          >
            Region
          </label>
          <p className="mt-1 text-sm text-[var(--perm-muted)] md:text-xs">
            Filter lists and feeds by area (URL-based for now).
          </p>
          <div className="mt-2 max-w-xs">
            <Suspense fallback={<div className="h-10 rounded-lg bg-[var(--perm-bg)]" />}>
              <RegionFilter id="footer-region" />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--perm-border)] px-2 py-5 text-center text-sm text-[var(--perm-muted)] md:py-4 md:text-xs">
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
