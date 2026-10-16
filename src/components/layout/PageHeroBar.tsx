import Image from "next/image";
import type { ReactNode } from "react";

export function PageHeroBar({
  title,
  iconSrc,
  subtitle,
  actions,
}: {
  title: string;
  iconSrc?: string;
  subtitle: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="mb-8 rounded-[var(--pb-r-md)] border border-[var(--pb-line)] bg-[var(--pb-surface)] px-5 py-5 shadow-[var(--pb-shadow-card)] sm:px-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {iconSrc ? (
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--pb-bg)]"
                aria-hidden="true"
              >
                <Image
                  src={iconSrc}
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                  className="h-8 w-8"
                />
              </span>
            ) : null}
            <h1 className="min-w-0 text-2xl font-semibold text-[var(--perm-primary)]">{title}</h1>
          </div>
          <p className="mt-2 max-w-3xl text-[var(--perm-text-secondary)]">{subtitle}</p>
          {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </div>
    </section>
  );
}
