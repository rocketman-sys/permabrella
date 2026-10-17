// Export the selected vector wordmark as a transparent logo and social image.
// Run with: node scripts/generate-share-image.mjs
import { readFile } from "node:fs/promises";
import sharp from "sharp";

const logo = await readFile(new URL("../public/brand/logo-permabrella-quicksand.svg", import.meta.url), "utf8");
const artwork = logo.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fffaf0"/>
  <g transform="translate(60 45) scale(1.8)">${artwork}</g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(
  new URL("../public/brand/share-permabrella-v2.png", import.meta.url).pathname,
);

await sharp(Buffer.from(logo)).resize(1200, 600).png().toFile(
  new URL("../public/brand/logo-permabrella-quicksand.png", import.meta.url).pathname,
);
