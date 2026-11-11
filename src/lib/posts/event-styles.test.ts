import assert from "node:assert/strict";
import test from "node:test";
import { eventStyle, parseEventStyle } from "./event-styles";

const listed: Array<[string, string, ReturnType<typeof eventStyle>]> = [
  ["Murwillumbah Farmers’ Market — 11 November", "Shop seasonal produce from local farmers.", "markets"],
  ["Newrybar Twilight Market — 11 November", "Shop fresh produce and local food stalls.", "markets"],
  ["Byron Farmers Market — 12 November", "Meet regional growers.", "markets"],
  ["Mullumbimby Farmers Market — 13 November", "Shop seasonal produce.", "markets"],
  ["Bangalow Farmers Market — 14 November", "Pick up seasonal local food.", "markets"],
  ["Lismore Farmers Market: 14 November", "Meet local growers.", "markets"],
  ["Haul. Pre-Loved Market: Ballina", "Browse second-hand clothing and join a community book swap.", "markets"],
  ["Ballina Farmers & Producers Market: 15 November", "Shop for seasonal produce.", "markets"],
  ["Mullumbimby Community Market — November", "Explore local plant stalls and live music.", "markets"],
  ["Makers & Finders Market — November", "Browse local produce and handmade goods.", "markets"],
  ["Nimbin Re-love Market — November", "A local market for pre-loved goods.", "markets"],
  ["Australian Pollinator Week Webinar", "A webinar about pollinators.", "talks"],
  ["Pollinator Photography Webinar", "Hear practical advice from photographers.", "talks"],
  ["Powerful Pollinators Webinar", "Learn how to support pollinators.", "talks"],
  ["Tweed Landcare: forest ecology presentation and AGM", "A presentation on forest ecology.", "talks"],
  ["Applying Doughnut Economics to Food Systems: online launch", "Includes a sourcebook and workshop tools for communities.", "talks"],
  ["Food System Governance in Practice: Lessons from the Americas", "An online discussion of food-system governance.", "talks"],
  ["Regenerating the Regions: Thriving Regional Food Infrastructure (Public Webinar)", "A free public webinar.", "talks"],
  ["Regenerating the Regions: Thriving Regional Food Infrastructure (Government & Policy Webinar)", "A free briefing.", "talks"],
  ["Emerging Weeds: Recognising threats, taking action", "Landcare Victoria hosts an online session about identifying weeds.", "talks"],
  ["Upper Coopers Creek Landcare Strategic Plan discussion", "A discussion of the new strategic plan.", "talks"],
  ["50 years of Conservation & Landcare: The Future of our Forests", "A community panel and audience Q&A about forest protection.", "talks"],
  ["Rehydrate Australia — film, supper and discussion at Pearces Creek Hall", "Watch a documentary, followed by a discussion. For a practical follow-up, the Natural Sequence Farming Field Day at Banyula Farm runs the next day.", "talks"],
  ["Livestock Health and Husbandry Workshop — Murwillumbah", "A practical workshop for landholders.", "workshops"],
  ["Nimbin Skill Share — November", "A monthly gathering for sharing practical skills.", "workshops"],
  ["Fermentation Workshop: Native Australian Ingredients", "A hands-on workshop with Byron Fermentary.", "workshops"],
  ["Darren Doherty — farm planning for agroforestry recordings", "Watch the two-part farm-planning workshop hosted earlier in 2026.", "workshops"],
  ["Natural Sequence Farming Field Day at Banyula Farm", "Learn about landscape restoration.", "field-trips"],
  ["North Coast Beef Producers Field Day 2026", "A field day on herd productivity.", "field-trips"],
  ["Great Southern BioBlitz Day 3 — Fingal Head", "A family-friendly biodiversity hunt.", "field-trips"],
  ["Let's Go Mothing! at Maclean", "A beginner-friendly evening observing moths.", "field-trips"],
  ["Tea and Gardening at the Lily Pad: 12 November", "Practical gardening at Mullum Gardens.", "working-bees"],
  ["Community Planting and Creek Walk", "A creek walk and planting morning.", "working-bees"],
  ["Saturday Working Bee", "Join the monthly working bee.", "working-bees"],
  ["Beach Clean Up & Litter Survey", "A coastal clean-up.", "working-bees"],
  ["Nimbin Food Swap — November", "Bring surplus food, seeds or plants.", "meetups"],
  ["Singing Our Future Into Being", "A community gathering using song.", "meetups"],
  ["Pongo la Tetera (Kettle's On) -", "The kettle’s on every Tuesday morning.", "meetups"],
  ["World Soil Day Competition — entries close 4 December", "A soil-health competition for producers and groups.", null],
  ["Community Planting and Creek Walk with Kyogle Landcare", "", "working-bees"],
  ["Beach Clean Up & Litter Survey with Ballina Coastcare", "", "working-bees"],
  ["Mullumbimby Community Garden — Saturday Working Bee", "", "working-bees"],
  ["Re-love Market: Local Pantry at Seven on Sibley", "", "markets"],
  ["The Channon Craft Market — November", "", "markets"],
  ["Ocean Champion Citizen Science Workshop", "", "workshops"],
  ["ReMade Eco-Craft Workshop", "", "workshops"],
  ["Herbal Creams Making Hands-On Workshop", "", "workshops"],
  ["Gullibul Daytime Dreaming Cultural Tour — 21 October", "", "field-trips"],
  ["Citizen Science: Catchment Health Testing Spring 2026", "", "field-trips"],
  ["Kumbartcho Farm Agroecology Dialogue (Kilkivan, QLD)", "", "talks"],
  ["Science in the Federal Hall: Nature Based Solutions for Flood Resilience", "", "talks"],
  ["Nimbin Food, Seed and Plant Swap", "", "meetups"],
  ["Nimbin Saturday Food Swap", "", "meetups"],
  ["Mullumbimby Community Garden — Tuesday Community Lunch", "", "meetups"],
  ["Free Community Breakfast — Jacaranda Thursday", "", "meetups"],
  ["Picnic by the River – Richmond RiverFest Closing Event", "", "meetups"],
  ["River Dreaming — Grafton Jacaranda Festival", "", "meetups"],
];

test("live event listings fall into the style groups", () => {
  for (const [title, description, expected] of listed) {
    assert.equal(eventStyle({ title, description }), expected, title);
  }
});

test("unknown style parameters are ignored", () => {
  assert.equal(parseEventStyle("markets"), "markets");
  assert.equal(parseEventStyle("open"), null);
  assert.equal(parseEventStyle(null), null);
});
