import type { ReactNode } from "react";
import { GlobalVisualMenu } from "./GlobalVisualMenu";

export function PageHeroBar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="mb-8 rounded-[var(--pb-r-md)] border border-[var(--pb-line)] bg-[var(--pb-surface)] px-5 py-5 shadow-[var(--pb-shadow-card)] sm:px-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-[var(--perm-primary)]">{title}</h1>
          <p className="mt-2 max-w-3xl text-[var(--perm-text-secondary)]">{subtitle}</p>
          {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
        </div>
        <div className="hidden shrink-0 md:block">
          <GlobalVisualMenu />
        </div>
      </div>
    </section>
  );
}
