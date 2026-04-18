export const REGIONS = [
  { value: "lismore", label: "Lismore" },
  { value: "byron_bay", label: "Byron Bay" },
  { value: "mullumbimby", label: "Mullumbimby" },
  { value: "nimbin", label: "Nimbin" },
  { value: "bangalow", label: "Bangalow" },
  { value: "kyogle", label: "Kyogle" },
  { value: "casino", label: "Casino" },
  { value: "tweed", label: "Tweed" },
  { value: "ballina", label: "Ballina" },
  { value: "murwillumbah", label: "Murwillumbah" },
  { value: "dunoon", label: "Dunoon" },
  { value: "clunes", label: "Clunes" },
  { value: "federal", label: "Federal" },
  { value: "the_channon", label: "The Channon" },
  { value: "uki", label: "Uki" },
  { value: "other", label: "Other" },
] as const;

export type Region = (typeof REGIONS)[number]["value"];

const REGION_SET = new Set(REGIONS.map((r) => r.value));

/** Returns undefined if the string is not a valid region slug. */
export function parseRegionParam(value: string | null): Region | undefined {
  if (!value) return undefined;
  return REGION_SET.has(value as Region) ? (value as Region) : undefined;
}
