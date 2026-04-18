"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { REGIONS } from "@/lib/regions";
import { Select } from "@/components/ui/Select";

export function RegionFilter({ id }: { id?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const value = searchParams.get("region") ?? "";

  return (
    <Select
      id={id}
      aria-label="Filter by region"
      value={value}
      onChange={(e) => {
        const next = new URLSearchParams(searchParams.toString());
        const v = e.target.value;
        if (v) next.set("region", v);
        else next.delete("region");
        const q = next.toString();
        router.push(q ? `?${q}` : "?", { scroll: false });
      }}
    >
      <option value="">All regions</option>
      {REGIONS.map((r) => (
        <option key={r.value} value={r.value}>
          {r.label}
        </option>
      ))}
    </Select>
  );
}
