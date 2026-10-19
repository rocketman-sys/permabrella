import { searchTerms, type HelperCategory, type HelperInput } from './policy';

// Related discovery terms, not claims that a funding program covers every topic.
// AND between concepts/places; OR within a small, explicit synonym family.
const restoration = ['regenerat', 'restor', 'reveget', 'conservation', 'biodiversity', 'habitat', 'riparian', 'landcare', 'bushcare', 'soil', 'sustainable agriculture'];
const naturalLanguage = new Set('help need needs find looking seek seeking get getting current currently now today open funding funds fund money support opportunity opportunities project projects initiative initiatives apply applying application applications options option'.split(' '));

export function listingSearchPlan(input: HelperInput): { category: HelperCategory; groups: string[][] } {
  const category = input.category !== 'all' ? input.category
    : /\b(grants?|funding|funds?|sponsorship)\b/i.test(input.query) ? 'grants'
    : /\b(events?|workshops?)\b/i.test(input.query) ? 'events' : 'all';
  let query = input.query.replace(/\bbush\s+regen(?:eration|erative)?\b/gi, 'regeneration');
  // The grants catalogue is already scoped to this region; keep organisation
  // names such as SEED Northern Rivers unchanged in other categories.
  if (category === 'grants') query = query.replace(/\bnorthern rivers\b/gi, '');
  const groups: string[][] = [];
  for (const term of searchTerms(query, 100).filter(term => !naturalLanguage.has(term))) {
    const variants = /^(regen|regeneration|regenerative|regenerating|restoration|restore|restoring|revegetation|conservation|biodiversity|bushcare|landcare)$/.test(term)
      ? restoration
      : term === 'compost' || term === 'composting' ? ['compost', 'organic waste', 'resource recovery']
      : [term];
    if (!groups.some(group => group.join('|') === variants.join('|'))) groups.push(variants);
  }
  return { category, groups: groups.slice(0, 6) };
}
