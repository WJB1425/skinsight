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

// ==================== 聚合物 / 高分子 ====================
// 这些成分是聚合度 n 不固定的聚合物（或交联/共聚/支化高分子）。用 SMILES 画出一段
// 固定长度的链在化学上是误导性的，所以详情页改为展示「重复单元 + 外层方括号 + 下标 n」。
//   - kind:'repeat' —— 有明确重复单元：画出单个重复单元片段并叠加 [ ]ₙ。
//   - kind:'text'   —— 交联/无规共聚/庞大支化，无法用单一二维骨架表示：仅展示线式记号 + 说明。
// 仅收录真正聚合度不定的聚合物；像 cyclopentasiloxane(D5)、trisiloxane、caprylyl-methicone
// 这些是结构确定的离散分子，不入表，继续走普通分子渲染。
export type PolymerKind = 'repeat' | 'text';

export interface PolymerInfo {
  kind: PolymerKind;
  /** 线式记号，mono 展示，如 '‒[Si(CH₃)₂‒O]‒ₙ'。始终存在。 */
  notation: string;
  /** 单个重复单元的合法 SMILES（用 * 表示链接位点）；仅 kind:'repeat'。 */
  repeatUnitSmiles?: string;
  /** 叠加的下标符号：'n'(默认) / 'x/y'(共聚物)。 */
  subscript?: string;
  /** 简短中文说明（n 不定 / 交联 / 共聚 / 支化等）。 */
  note: string;
}

export const POLYMER_INFO: Record<string, PolymerInfo> = {
  dimethicone: {
    kind: 'repeat',
    notation: '‒[Si(CH₃)₂‒O]‒ₙ',
    repeatUnitSmiles: '*[Si](C)(C)O*',
    subscript: 'n',
    note: '聚二甲基硅氧烷（PDMS）是硅氧链聚合物，链长 n 不固定。此处展示其重复单元，而非某条固定长度的链。',
  },
  'peg-100-stearate': {
    kind: 'repeat',
    notation: 'C₁₇H₃₅CO‒[OCH₂CH₂]‒ₙOH',
    repeatUnitSmiles: '*CCO*',
    subscript: 'n',
    note: '硬脂酸与聚乙二醇酯化；PEG 链由乙氧基（‒CH₂CH₂O‒）重复构成，聚合度 n 约 100 但为分布值。',
  },
  'sodium-laureth-sulfate': {
    kind: 'repeat',
    notation: 'C₁₂H₂₅‒[OCH₂CH₂]‒ₙOSO₃⁻Na⁺',
    repeatUnitSmiles: '*CCO*',
    subscript: 'n',
    note: '月桂醇经乙氧基化（n 个乙氧基，分布值）后硫酸化，故无单一固定结构，此处展示其乙氧基重复单元。',
  },
  carbomer: {
    kind: 'text',
    notation: '‒[CH₂‒CH(COOH)]‒ₙ（交联）',
    subscript: 'n',
    note: '交联型聚丙烯酸，三维网状交联结构无法用单一二维骨架表示，此处仅示意其理想重复单元。',
  },
  'acrylates-copolymer': {
    kind: 'text',
    notation: '‒[CH₂‒CH(CO₂R)]‒ₓ[CH₂‒C(CH₃)(CO₂R′)]‒ᵧ',
    subscript: 'x/y',
    note: '丙烯酸（酯）类无规共聚物，由多种单体随机共聚，组成与序列不固定，故仅作示意。',
  },
  'xanthan-gum': {
    kind: 'text',
    notation: '支化多糖（纤维素主链 + 三糖侧链，五糖重复单元）',
    subscript: 'n',
    note: '微生物发酵多糖，主链为纤维素骨架并带三糖侧链，分子庞大且支化，不展示二维骨架。',
  },
};

/** 该成分是否为聚合物（聚合度不定），详情页应展示重复单元/线式记号而非固定链。 */
export function isPolymer(id: string): boolean {
  return id in POLYMER_INFO;
}

// 结构展示的三态：无机晶体 / 聚合物 / 普通有机分子。两个调用点（详情、卡片）共用，
// 优先级 inorganic → polymer → molecule（当前数据中互斥，此处明确先后）。
export type StructureKind = 'inorganic' | 'polymer' | 'molecule';

export function getStructureKind(id: string): StructureKind {
  if (isInorganic(id)) return 'inorganic';
  if (isPolymer(id)) return 'polymer';
  return 'molecule';
}
