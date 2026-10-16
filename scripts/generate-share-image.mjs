// Re-export the original vector logo without enlarging a low-resolution bitmap.
// Run with: node scripts/generate-share-image.mjs
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const logo = await readFile(new URL("../public/brand/logo-permabrella.svg", import.meta.url), "utf8");
const artwork = logo.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fffaf0"/>
  <g transform="translate(264 -21) scale(7)" fill="none">${artwork}</g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(
  new URL("../public/brand/share-permabrella-v1.png", import.meta.url).pathname,
);
