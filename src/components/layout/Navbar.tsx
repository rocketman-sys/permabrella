import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

const navLinks = [
  { href: "/events", label: "Events" },
  { href: "/offerings", label: "Offerings" },
  { href: "/land-connect", label: "Land Connect" },
  { href: "/directory", label: "Directory" },
  { href: "/community", label: "Community" },
];

const linkPrimary =
  "inline-flex items-center justify-center rounded-lg bg-[var(--perm-primary)] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-95 sm:text-sm";

const linkGhost =
  "inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--perm-primary)] transition hover:bg-black/[0.04] sm:text-sm";

const linkSecondary =
  "inline-flex items-center justify-center rounded-lg bg-[var(--perm-earth)] px-3 py-1.5 text-xs font-medium text-white transition hover:opacity-95 sm:text-sm";

export async function Navbar() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--perm-border)] bg-[var(--perm-card)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-[var(--perm-primary)]"
        >
          Permabrella
        </Link>
        <nav className="order-3 flex w-full flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-[var(--perm-text)] md:order-none md:flex md:w-auto md:items-center">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[var(--perm-text-secondary)] hover:text-[var(--perm-secondary)]"
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
              <span className="hidden max-w-[10rem] truncate text-sm text-[var(--perm-muted)] sm:inline">
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
