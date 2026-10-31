import assert from "node:assert/strict";
import test from "node:test";
import { pageMetadata, shareImage } from "./metadata";

const listing = { title: "Seed swap | PermaBrella", description: "Bring spare seeds to share with local growers.", path: "/events/example-id" };

test("shared links describe and point to the listing, with a high-resolution brand fallback", () => {
  const result = pageMetadata(listing);
  assert.equal(result.title, listing.title);
  assert.equal(result.openGraph?.title, listing.title);
  assert.equal(result.openGraph?.description, listing.description);
  assert.equal(result.openGraph?.url, "https://www.permabrella.org/events/example-id");
  assert.equal(result.alternates?.canonical, result.openGraph?.url);
  assert.deepEqual(result.openGraph?.images, [shareImage]);
  assert.deepEqual(result.twitter?.images, [shareImage]);
  assert.equal(shareImage.width, 1200);
  assert.equal(shareImage.height, 630);
});

test("listing photographs take priority without inventing their dimensions", () => {
  const result = pageMetadata({ ...listing, imageUrl: "https://example.org/event.jpg" });
  assert.deepEqual(result.openGraph?.images, [{ url: "https://example.org/event.jpg", alt: listing.title }]);
  const local = pageMetadata({ ...listing, imageUrl: "/brand/share-permabrella-v2.png" });
  assert.deepEqual(local.openGraph?.images, [{ url: shareImage.url, alt: listing.title }]);
});

test("invalid image links fall back to the umbrella", () => {
  for (const imageUrl of ["javascript:alert(1)", "//example.org/image.jpg", "https://user:password@example.org/photo.jpg", "https://example.org\\photo.jpg", "broken-url", ""]) {
    assert.deepEqual(pageMetadata({ ...listing, imageUrl }).openGraph?.images, [shareImage]);
  }
});

test("long or formatted descriptions become concise plain-text previews", () => {
  const result = pageMetadata({ ...listing, description: "<p>Seeds</p>\n\n  to share. " + "More details. ".repeat(40) });
  assert.ok(result.description!.startsWith("Seeds to share."));
  assert.ok(result.description!.length <= 200);
  assert.ok(result.description!.endsWith("…"));
  assert.equal(result.openGraph?.description, result.description);
});
