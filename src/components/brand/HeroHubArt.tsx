import Image from "next/image";
import Link from "next/link";
import { LogoPermaBrella } from "@/components/brand/Logo";

/** ViewBox radius for satellite centers (% of viewBox). Slightly larger so a bigger centre logo clears the ring. */
const R = 44;

const ICON_SCALE: Record<string, number> = {
  "/brand/icon-offerings.svg": 1.18,
};

const HUB_MAX_SATELLITES = 6;

function hubPoints(n: number): { x: number; y: number }[] {
  const count = Math.min(Math.max(n, 1), HUB_MAX_SATELLITES);
  return Array.from({ length: count }, (_, k) => {
    const rad = -Math.PI / 2 + (k * 2 * Math.PI) / count;
    return {
      x: 50 + R * Math.cos(rad),
      y: 50 + R * Math.sin(rad),
    };
  });
}

export type HeroHubItem = {
  href: string;
  icon: string;
  title: string;
  /** Short keyword under icons on quick-access cards — shown on hub hover. */
  tag?: string;
};

export function HeroHubArt({
  items,
  logoSize = 88,
}: {
  items: HeroHubItem[];
  logoSize?: number;
}) {
  const n = Math.min(items.length, HUB_MAX_SATELLITES);
  const points = hubPoints(n);
  const list = items.slice(0, n);
  const centerLogoSize = Math.round(logoSize * 1.5);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(100%,300px)]">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <LogoPermaBrella
          size={centerLogoSize}
          className="relative z-10 drop-shadow-sm"
        />
      </div>

      {list.map((item, i) => {
        const p = points[i];
        if (!p) return null;
        const scale = ICON_SCALE[item.icon] ?? 1;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="group absolute z-20 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--pb-primary)]"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            aria-label={item.title}
            title={item.title}
          >
            <div className="transition-transform duration-200 ease-out group-hover:scale-105 group-focus-visible:scale-105">
              <div
                className="drop-shadow-sm"
                style={{
                  width: logoSize,
                  height: logoSize,
                  transform: scale === 1 ? undefined : `scale(${scale})`,
                  transformOrigin: "center",
                }}
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={logoSize}
                  height={logoSize}
                  unoptimized
                  style={{ width: logoSize, height: logoSize }}
                />
              </div>
            </div>
            {item.tag ? (
              <span
                className="pb-tag pointer-events-none absolute left-1/2 top-full z-30 mt-1.5 -translate-x-1/2 translate-y-2 whitespace-nowrap rounded-[var(--pb-r-sm)] bg-[color-mix(in_srgb,var(--pb-surface)_92%,transparent)] px-2 py-0.5 text-[var(--pb-accent-2)] opacity-0 shadow-[var(--pb-shadow-card)] ring-1 ring-[var(--pb-line)] backdrop-blur-[2px] transition-[opacity,transform] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
                aria-hidden
              >
                {item.tag}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
