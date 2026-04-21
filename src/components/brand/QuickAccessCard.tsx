import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function QuickAccessCard({
  iconSrc,
  iconAlt,
  tag,
  title,
  description,
  href,
}: {
  iconSrc: string;
  iconAlt: string;
  tag?: string;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-[var(--pb-r-md)] border border-[var(--pb-line)] bg-[var(--pb-surface)] px-[22px] pb-[22px] pt-6 shadow-[var(--pb-shadow-card)] transition",
        "hover:-translate-y-px hover:border-[var(--pb-primary)] hover:shadow-[var(--pb-shadow-card-hover)]"
      )}
    >
      <div
        className="mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--pb-bg)] text-[var(--pb-ink)]"
        aria-hidden
      >
        <Image
          src={iconSrc}
          alt={iconAlt}
          width={32}
          height={32}
          unoptimized
          className="h-8 w-8"
        />
      </div>
      {tag ? (
        <p className="pb-tag mb-1 text-[var(--pb-accent-2)]">{tag}</p>
      ) : null}
      <h3 className="text-lg font-bold leading-snug tracking-tight text-[var(--pb-ink)] md:text-base">
        {title}
      </h3>
      <p className="mt-1.5 text-base leading-relaxed text-[var(--pb-ink-soft)] md:text-[13.5px] md:leading-normal">
        {description}
      </p>
    </Link>
  );
}
