import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { BrandLogo } from "@/components/brand/Logo";
import { ActiveNavLinks } from "./ActiveNavLinks";
import { MobileMenu } from "./MobileMenu";

const navLinks = [
  { href: "/equipment", label: "Equipment" },
  { href: "/events", label: "Events" },
  { href: "/offerings", label: "Exchange" },
  { href: "/land-connect", label: "Land Connect" },
  { href: "/directory", label: "Groups" },
  { href: "/grants", label: "Grants" },
  { href: "/community", label: "Discuss" },
  { href: "/helper", label: "Helper" },
];

const linkPrimary =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--pb-r-sm)] bg-[var(--pb-primary)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--pb-primary-dk)]";

const linkGhost =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--pb-r-sm)] px-3 py-2 text-sm font-semibold text-[var(--pb-ink)] transition hover:bg-[var(--pb-bg)]";

const linkSecondary =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--pb-r-sm)] bg-[var(--pb-accent)] px-3 py-2 text-sm font-semibold text-[var(--pb-ink)] transition hover:opacity-95";

export async function Navbar() {
  const session = await auth();
  const account = session?.user ? (
    <form action={async () => { "use server"; await signOut({ redirectTo: "/" }); }}>
      <Button variant="ghost" type="submit">Sign out</Button>
    </form>
  ) : <><Link href="/login" className={linkGhost}>Log in</Link><Link href="/register" className={linkPrimary}>Create account</Link></>;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--pb-line)] bg-[var(--pb-surface)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
        <Link
          href="/"
          aria-label="PermaBrella home"
          className="inline-flex shrink-0 items-center text-[var(--pb-ink)]"
        >
          <BrandLogo />
        </Link>
        <nav aria-label="Main navigation" className="hidden items-center gap-3 text-sm font-semibold xl:flex">
          <ActiveNavLinks links={navLinks} />
        </nav>
        <div className="hidden items-center gap-2 xl:flex">
          <Link href="/submit" className={linkSecondary}>
            Post a listing
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
        <MobileMenu links={navLinks} account={account} />
      </div>
    </header>
  );
}
