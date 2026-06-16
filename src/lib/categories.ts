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

// ==================== 无机 / 晶体成分 ====================
// 这些是无机晶体 / 矿物，以晶格(晶胞)形式存在，没有单一有机分子结构。用 SMILES 画出来
// 会得到误导性的「假分子」，所以详情页对它们不画分子骨架，改展示规范下标化学式 + 标注。
// 常规化学式（习惯写法，非 openchemlib 的元素排序），FormulaText 会把数字渲染为下标。
export const INORGANIC_FORMULA: Record<string, string> = {
  'titanium-dioxide': 'TiO2',
  'zinc-oxide': 'ZnO',
  'iron-oxides': 'Fe2O3 / Fe3O4 等',
  silica: 'SiO2',
  mica: 'KAl2(AlSi3O10)(OH)2',
  talc: 'Mg3Si4O10(OH)2',
};

/** 该成分是否为无机/晶体（矿物），详情页应展示晶体化学式而非分子骨架图。 */
export function isInorganic(id: string): boolean {
  return id in INORGANIC_FORMULA;
}
