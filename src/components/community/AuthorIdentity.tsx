import { Badge } from "@/components/ui/Badge";
import type { AuthorBadge } from "@/lib/community/authorship";

export function AuthorIdentity({
  name,
  badge,
}: {
  name: string | null;
  badge: AuthorBadge | null;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span>{name ?? "Member"}</span>
      {badge ? (
        <Badge className="bg-transparent px-2 py-0 text-[10px] font-medium text-[var(--perm-muted)] ring-[var(--perm-border)]">
          {badge}
        </Badge>
      ) : null}
    </span>
  );
}
