"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { REGIONS } from "@/lib/regions";
import { createDirectoryEntryAction, type FormState } from "../actions";

export function DirectoryForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createDirectoryEntryAction,
    null
  );

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-4">
      <div>
        <label htmlFor="title" className="text-sm font-medium text-[var(--perm-text)]">
          Group or organisation name
        </label>
        <Input id="title" name="title" required className="mt-1" />
      </div>
      <div>
        <label htmlFor="description" className="text-sm font-medium text-[var(--perm-text)]">
          About
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={6}
          className="mt-1 w-full rounded-lg border border-[var(--perm-border)] bg-white px-3 py-2 text-[var(--perm-text)] placeholder:text-[var(--perm-muted)] focus:border-[var(--perm-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--perm-secondary)]/30"
        />
      </div>
      <div>
        <label htmlFor="region" className="text-sm font-medium text-[var(--perm-text)]">
          Region
        </label>
        <Select id="region" name="region" className="mt-1">
          <option value="">—</option>
          {REGIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <label htmlFor="contactPhone" className="text-sm font-medium text-[var(--perm-text)]">
          Phone (optional)
        </label>
        <Input
          id="contactPhone"
          name="contactPhone"
          type="tel"
          autoComplete="tel"
          placeholder="e.g. 02 … or 04 …"
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="contactEmail" className="text-sm font-medium text-[var(--perm-text)]">
          Email (optional)
        </label>
        <Input
          id="contactEmail"
          name="contactEmail"
          type="email"
          autoComplete="email"
          placeholder="contact@example.org"
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="contactMethod" className="text-sm font-medium text-[var(--perm-text)]">
          Other contact notes (optional)
        </label>
        <Input
          id="contactMethod"
          name="contactMethod"
          placeholder="e.g. best time to call, contact form URL, social handle"
          className="mt-1"
        />
      </div>
      <div>
        <label htmlFor="externalUrl" className="text-sm font-medium text-[var(--perm-text)]">
          Website or social link (optional)
        </label>
        <Input id="externalUrl" name="externalUrl" type="url" className="mt-1" />
      </div>
      <div>
        <label htmlFor="imageUrl" className="text-sm font-medium text-[var(--perm-text)]">
          Logo or image URL (optional)
        </label>
        <Input id="imageUrl" name="imageUrl" type="url" className="mt-1" />
      </div>
      {state?.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
        {pending ? "Publishing…" : "Publish listing"}
      </Button>
    </form>
  );
}
