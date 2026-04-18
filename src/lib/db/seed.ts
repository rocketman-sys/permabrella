import { db } from "./index";
import { topics } from "./schema";

/** Topic rows; icons can be added in admin later to avoid encoding issues in tooling. */
const initialTopics = [
  {
    name: "Soil & Composting",
    slug: "soil-composting",
    description:
      "Soil health, composting methods, biochar, worm farms, and soil biology",
    sortOrder: 1,
  },
  {
    name: "Seeds & Propagation",
    slug: "seeds-propagation",
    description:
      "Seed saving, swaps, germination, nursery techniques, and plant propagation",
    sortOrder: 2,
  },
  {
    name: "Market Gardens & Growing",
    slug: "market-gardens",
    description:
      "Market gardening, crop planning, pest management, and growing techniques",
    sortOrder: 3,
  },
  {
    name: "Land Access & Sharing",
    slug: "land-access",
    description:
      "Finding land, land sharing arrangements, leases, and access agreements",
    sortOrder: 4,
  },
  {
    name: "Food Preservation",
    slug: "food-preservation",
    description:
      "Fermenting, drying, canning, root cellaring, and storage techniques",
    sortOrder: 5,
  },
  {
    name: "Regen Ag & Permaculture",
    slug: "regen-ag-permaculture",
    description:
      "Regenerative agriculture, permaculture design, agroforestry, and holistic management",
    sortOrder: 6,
  },
  {
    name: "Water & Irrigation",
    slug: "water-irrigation",
    description:
      "Water harvesting, irrigation systems, swales, dams, and water management",
    sortOrder: 7,
  },
  {
    name: "General Discussion",
    slug: "general",
    description: "Anything food security related that doesn't fit elsewhere",
    sortOrder: 99,
  },
];

async function seed() {
  console.log("Seeding topics...");
  await db
    .insert(topics)
    .values(initialTopics)
    .onConflictDoNothing({ target: topics.slug });
  console.log("Done.");
}

seed().catch(console.error);
