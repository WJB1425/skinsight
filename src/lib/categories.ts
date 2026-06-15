// High-level functional grouping for the ingredient filter.
//
// The raw `category` field on each ingredient is very granular (30+ "X/Y"
// combos like "抗氧化/保湿"), which makes a flat filter an ugly wall of pills.
// These groups collapse them into a handful of meaningful filters. Each raw
// category maps to exactly one group via the FIRST keyword set it matches
// (priority, top→bottom), with a base/other fallback so nothing is orphaned.
//
// The granular category is still shown verbatim on cards/detail — this only
// powers the filter chips.

export interface IngredientGroup {
  id: string;
  label: string;
  /** A category belongs to this group if it contains any of these substrings. */
  keywords: string[];
}

// Order matters — first match wins. Specific actives are checked before the
// broad "保湿修护" net, and pure-formulation terms last.
export const INGREDIENT_GROUPS: IngredientGroup[] = [
  { id: 'sun', label: '防晒', keywords: ['防晒'] },
  { id: 'exfoliate', label: '去角质', keywords: ['去角质', 'BHA', 'AHA'] },
  { id: 'oil', label: '控油', keywords: ['控油', '吸油'] },
  { id: 'brighten', label: '美白提亮', keywords: ['美白', '提亮', '淡斑'] },
  { id: 'antiage', label: '抗老抗氧', keywords: ['抗老', '抗衰', '抗氧化', '紧致'] },
  { id: 'soothe', label: '舒缓抗炎', keywords: ['舒缓', '抗炎'] },
  { id: 'cleanse', label: '清洁/表活', keywords: ['表活', '清洁', '洁面', '起泡'] },
  { id: 'hydrate', label: '保湿修护', keywords: ['保湿', '修护', '屏障', '脂质', '油脂'] },
  {
    id: 'base',
    label: '基质/其他',
    keywords: ['硅油', '乳化', '脂肪醇', '防腐', '香料', '香', '精油', '着色', '珠光', '成膜', '柔润', '柔焦', '螯合', '增稠', 'pH'],
  },
];

const FALLBACK_GROUP_ID = 'base';

/** Map a raw ingredient category to its high-level group id. */
export function getCategoryGroup(category: string): string {
  for (const group of INGREDIENT_GROUPS) {
    if (group.keywords.some((k) => category.includes(k))) return group.id;
  }
  return FALLBACK_GROUP_ID; // anything unmatched falls into 基质/其他
}
