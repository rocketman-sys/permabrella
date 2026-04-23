import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { LogoPermaBrella } from "@/components/brand/Logo";
import { ActiveNavLinks } from "./ActiveNavLinks";

const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/offerings", label: "Exchange" },
  { href: "/land-connect", label: "Land Connect" },
  { href: "/directory", label: "Groups" },
  { href: "/grants", label: "Grants" },
  { href: "/community", label: "Discuss" },
];

const linkPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--pb-r-sm)] bg-[var(--pb-primary)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--pb-primary-dk)]";

const linkGhost =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--pb-r-sm)] px-3 py-2 text-sm font-semibold text-[var(--pb-ink)] transition hover:bg-[var(--pb-bg)]";

const linkSecondary =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--pb-r-sm)] bg-[var(--pb-accent)] px-3 py-2 text-sm font-semibold text-[var(--pb-ink)] transition hover:opacity-95";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--pb-line)] bg-[var(--pb-surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[var(--pb-ink)]"
        >
          <LogoPermaBrella size={34} className="shrink-0" />
          <span className="pb-display text-xl leading-none tracking-tight sm:text-lg">
            PermaBrella
          </span>
        </Link>
        <nav className="order-3 flex w-full flex-wrap gap-x-4 gap-y-2 text-base font-semibold text-[var(--pb-ink)] md:order-none md:flex md:w-auto md:items-center md:text-sm">
          <ActiveNavLinks links={navLinks} />
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/submit" className={linkSecondary}>
            Post to Switchboard
          </Link>
          {session?.user ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-base text-[var(--pb-muted)] sm:inline md:text-sm">
                {session.user.name ?? session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="ghost" className="!min-h-10 !py-2 !text-sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className={linkGhost}>
                Log in
              </Link>
              <Link href="/register" className={linkPrimary}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
