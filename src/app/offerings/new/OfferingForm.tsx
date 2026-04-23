"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { REGIONS } from "@/lib/regions";
import { createOfferingAction, type FormState } from "../actions";

export function OfferingForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createOfferingAction,
    null
  );

  return (
    <form action={formAction} className="mx-auto max-w-xl space-y-4">
      <div>
        <label htmlFor="listingType" className="text-sm font-medium text-[var(--perm-text)]">
          Listing type
        </label>
        <Select id="listingType" name="listingType" className="mt-1" required defaultValue="offering">
          <option value="offering">Offering</option>
          <option value="wanted">Wanted</option>
        </Select>
      </div>
      <div>
        <label htmlFor="title" className="text-sm font-medium text-[var(--perm-text)]">
          Title
        </label>
        <Input id="title" name="title" required className="mt-1" />
      </div>
      <div>
        <label htmlFor="description" className="text-sm font-medium text-[var(--perm-text)]">
          Description
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
        <label htmlFor="locationDetail" className="text-sm font-medium text-[var(--perm-text)]">
          Pickup / location details (optional)
        </label>
        <Input id="locationDetail" name="locationDetail" className="mt-1" />
      </div>
      <div>
        <label htmlFor="expiresAt" className="text-sm font-medium text-[var(--perm-text)]">
          Expiry date (optional)
        </label>
        <Input id="expiresAt" name="expiresAt" type="datetime-local" className="mt-1" />
      </div>
      <div>
        <label htmlFor="contactPhone" className="text-sm font-medium text-[var(--perm-text)]">
          Phone (optional)
        </label>
        <Input id="contactPhone" name="contactPhone" type="tel" className="mt-1" />
      </div>
      <div>
        <label htmlFor="contactEmail" className="text-sm font-medium text-[var(--perm-text)]">
          Email (optional)
        </label>
        <Input id="contactEmail" name="contactEmail" type="email" className="mt-1" />
      </div>
      <div>
        <label htmlFor="contactMethod" className="text-sm font-medium text-[var(--perm-text)]">
          Other contact notes (optional)
        </label>
        <Input id="contactMethod" name="contactMethod" className="mt-1" />
      </div>
      <div>
        <label htmlFor="externalUrl" className="text-sm font-medium text-[var(--perm-text)]">
          Link (optional)
        </label>
        <Input id="externalUrl" name="externalUrl" type="url" className="mt-1" />
      </div>
      <div>
        <label htmlFor="imageUrl" className="text-sm font-medium text-[var(--perm-text)]">
          Image URL (optional)
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
