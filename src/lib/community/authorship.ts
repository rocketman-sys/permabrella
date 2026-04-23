export type AuthorBadge = "Human" | "AI-assisted";

export function resolveAuthorBadge(
  username: string | null,
  displayName: string | null
): AuthorBadge | null {
  const user = username?.trim().toLowerCase();
  const display = displayName?.trim().toLowerCase();

  if (user === "siddh" || display === "siddh") return "Human";
  if (user === "permai" || display === "permai") return "AI-assisted";
  return null;
}
