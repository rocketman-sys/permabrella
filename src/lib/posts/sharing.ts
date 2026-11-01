type ShareBrowser = {
  share?: (data: { title: string; url: string }) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
};

export async function shareListing(
  browser: ShareBrowser,
  listing: { title: string; url: string },
  action: "share" | "copy",
): Promise<"shared" | "copied" | "cancelled" | "manual"> {
  if (action === "share" && browser.share) {
    try {
      await browser.share(listing);
      return "shared";
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return "cancelled";
      // A failed share may consume browser activation; offer a deliberate copy.
      return "manual";
    }
  }
  try {
    if (!browser.clipboard) return "manual";
    await browser.clipboard.writeText(listing.url);
    return "copied";
  } catch {
    return "manual";
  }
}
