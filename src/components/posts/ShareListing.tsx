"use client";

import { useId, useRef, useState } from "react";
import { shareListing } from "@/lib/posts/sharing";

const buttonStyle = "inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--perm-border)] px-4 py-2 text-sm font-semibold text-[var(--perm-primary)] hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60";

export function ShareListing({ title, url }: { title: string; url: string }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const pending = useRef(false);
  const inputId = useId();

  async function handleShare(action: "share" | "copy") {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setResult("");
    try {
      setResult(await shareListing(navigator, { title, url }, action));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <section className="mt-5" aria-label="Share this listing">
      <div className="flex flex-wrap gap-2">
        <button type="button" className={buttonStyle} disabled={busy} onClick={() => handleShare("share")}>Share</button>
        <button type="button" className={buttonStyle} disabled={busy} onClick={() => handleShare("copy")}>Copy link</button>
      </div>
      <p role="status" className="mt-2 text-sm text-[var(--perm-muted)]">
        {result === "copied" ? "Link copied." : result === "manual" ? "Select and copy the link below, or try Copy link." : ""}
      </p>
      {result === "manual" ? <div className="mt-2">
        <label htmlFor={inputId} className="block text-sm font-medium">Listing link</label>
        <input id={inputId} type="url" readOnly value={url} onFocus={(event) => event.currentTarget.select()} className="mt-1 min-h-11 w-full min-w-0 rounded-lg border border-[var(--perm-border)] bg-[var(--perm-card)] px-3 text-sm" />
      </div> : null}
    </section>
  );
}
