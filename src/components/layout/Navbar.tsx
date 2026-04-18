import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { LogoPermaBrella } from "@/components/brand/Logo";

const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/offerings", label: "Offerings" },
  { href: "/land-connect", label: "Land Connect" },
  { href: "/directory", label: "Directory" },
  { href: "/community", label: "Community" },
];

const linkPrimary =
  "inline-flex items-center justify-center rounded-[var(--pb-r-sm)] bg-[var(--pb-primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--pb-primary-dk)] sm:text-sm";

const linkGhost =
  "inline-flex items-center justify-center rounded-[var(--pb-r-sm)] px-3 py-1.5 text-xs font-semibold text-[var(--pb-ink)] transition hover:bg-[var(--pb-bg)] sm:text-sm";

const linkSecondary =
  "inline-flex items-center justify-center rounded-[var(--pb-r-sm)] bg-[var(--pb-accent)] px-3 py-1.5 text-xs font-semibold text-[var(--pb-ink)] transition hover:opacity-95 sm:text-sm";

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
          <span className="pb-display text-lg leading-none tracking-tight">
            PermaBrella
          </span>
        </Link>
        <nav className="order-3 flex w-full flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-[var(--pb-ink)] md:order-none md:flex md:w-auto md:items-center">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[var(--pb-ink-soft)] transition hover:text-[var(--pb-primary)]"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/submit" className={linkSecondary}>
            Post to Switchboard
          </Link>
          {session?.user ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm text-[var(--pb-muted)] sm:inline">
                {session.user.name ?? session.user.email}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="ghost" className="!py-1.5 !text-xs" type="submit">
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
