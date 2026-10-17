// Editorially selected partners are tied to their group ID, not user-editable copy.
export const ROOTS_RIVERS_GROUP_ID = "a75ca39a-51af-4599-a7c1-ae124a4fba71";
export const FOUNDING_PARTNER_LABEL = "Founding partner of PermaBrella";

export function isFoundingPartner(post: { id: string; type: string }): boolean {
  return post.type === "directory_entry" && post.id === ROOTS_RIVERS_GROUP_ID;
}
