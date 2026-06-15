// 成分表文本 → 成分库匹配。
//
// 用户拍/贴的成分表是自由文本（中文 INCI 或英文）。这里把每个词条匹配到
// mock-data 里的成分；命中的真正进入分析，未命中的诚实地以「未收录」列出，
// 不静默丢弃。这是「拍成分表」路径的真实可用核心（OCR 只是把图片转成这段
// 文本，未来可插拔接入视觉模型）。

import { ingredients, type Ingredient } from './mock-data';

// 仅需补充「中文规范名 / 常见别名 / 关键英文」中 nameCn、name 之外的变体。
// nameCn、name 会自动并入匹配项，无需在此重复。
export const INGREDIENT_ALIASES: Record<string, string[]> = {
  'hyaluronic-acid': ['透明质酸', '透明质酸钠', '玻尿酸', 'sodium hyaluronate', 'hyaluronate', 'hyaluronic acid'],
  glycerin: ['甘油', '丙三醇', 'glycerin', 'glycerol'],
  ceramides: ['神经酰胺', '神经酰胺np', '神经酰胺3', 'ceramide', 'ceramides', 'ceramide np'],
  squalane: ['角鲨烷', 'squalane', 'squalene'],
  panthenol: ['泛醇', '维生素b5', '维他命b5', 'panthenol', 'd-panthenol', 'provitamin b5'],
  niacinamide: ['烟酰胺', '菸酰胺', '维生素b3', '维他命b3', 'niacinamide', 'nicotinamide'],
  'vitamin-c': ['维生素c', '维他命c', '维c', 'vc', '抗坏血酸', '左旋c', '左旋维c', 'l-抗坏血酸', 'ascorbic acid', 'l-ascorbic acid', 'ascorbyl'],
  arbutin: ['熊果苷', 'α-熊果苷', 'a-熊果苷', '阿尔法熊果苷', 'arbutin', 'alpha-arbutin'],
  'tranexamic-acid': ['传明酸', '凝血酸', '氨甲环酸', 'tranexamic acid'],
  'kojic-acid': ['曲酸', '麴酸', 'kojic acid'],
  retinol: ['视黄醇', 'a醇', '维生素a', '维a', 'retinol', 'vitamin a'],
  retinal: ['视黄醛', 'a醛', 'retinal', 'retinaldehyde'],
  bakuchiol: ['补骨脂酚', '补骨脂', 'bakuchiol'],
  peptides: ['胜肽', '多肽', '蓝铜胜肽', '铜胜肽', '三胜肽', '五胜肽', 'peptide', 'peptides', 'copper peptide', 'ghk-cu'],
  boseine: ['玻色因', '羟丙基四氢吡喃三醇', 'pro-xylane', 'proxylane', 'hydroxypropyl tetrahydropyrantriol'],
  'salicylic-acid': ['水杨酸', 'bha', 'salicylic acid', 'beta hydroxy acid'],
  'glycolic-acid': ['甘醇酸', '乙醇酸', '羟基乙酸', 'glycolic acid'],
  'lactic-acid': ['乳酸', 'lactic acid'],
  'mandelic-acid': ['杏仁酸', '苦杏仁酸', '扁桃酸', 'mandelic acid'],
  centella: ['积雪草', '积雪草提取物', '积雪草苷', 'centella', 'centella asiatica', 'cica'],
  allantoin: ['尿囊素', 'allantoin'],
  bisabolol: ['红没药醇', '没药醇', 'bisabolol'],
  madecassoside: ['羟基积雪草苷', '马蹄草苷', 'madecassoside'],
  'cucumber-extract': ['黄瓜提取物', '黄瓜', 'cucumber'],
  'ferulic-acid': ['阿魏酸', 'ferulic acid'],
  'vitamin-e': ['维生素e', '维他命e', 've', '生育酚', 'tocopherol', 'vitamin e'],
  resveratrol: ['白藜芦醇', 'resveratrol'],
  astaxanthin: ['虾青素', '虾红素', 'astaxanthin'],
  'zinc-pca': ['pca锌', '吡咯烷酮羧酸锌', 'zinc pca'],
  'azelaic-acid': ['壬二酸', '杜鹃花酸', 'azelaic acid'],
  'titanium-dioxide': ['二氧化钛', '钛白粉', 'titanium dioxide', 'ci77891'],
  'zinc-oxide': ['氧化锌', 'zinc oxide', 'ci77947'],
  dimethicone: ['聚二甲基硅氧烷', '二甲基硅油', '二甲硅油', '硅油', 'dimethicone'],
  cyclopentasiloxane: ['环五聚二甲基硅氧烷', '环五硅氧烷', 'cyclopentasiloxane'],
  'glyceryl-stearate': ['甘油硬脂酸酯', '单硬脂酸甘油酯', '硬脂酸甘油酯', 'glyceryl stearate'],
  'cetearyl-alcohol': ['鲸蜡硬脂醇', '十六十八醇', 'cetearyl alcohol'],
  phenoxyethanol: ['苯氧乙醇', 'phenoxyethanol'],
  ethylhexylglycerin: ['乙基己基甘油', 'ethylhexylglycerin'],
  fragrance: ['香精', '香料', '日用香精', 'parfum', 'fragrance', 'perfume'],
  octocrylene: ['奥克立林', 'octocrylene'],
  avobenzone: ['阿伏苯宗', '丁基甲氧基二苯甲酰基甲烷', 'avobenzone', 'butyl methoxydibenzoylmethane'],
  'tinosorb-s': ['双-乙基己氧苯酚甲氧苯基三嗪', 'bemotrizinol', 'tinosorb s'],
  'iron-oxides': ['氧化铁', '氧化铁类', 'iron oxide', 'iron oxides', 'ci77491', 'ci77492', 'ci77499'],
  mica: ['云母', 'mica', 'ci77019'],
  talc: ['滑石粉', '滑石', 'talc'],
  silica: ['硅石', '二氧化硅', 'silica'],
  'caprylyl-methicone': ['辛基聚甲基硅氧烷', 'caprylyl methicone'],
  'acrylates-copolymer': ['丙烯酸酯类共聚物', '丙烯酸(酯)类共聚物', 'acrylates copolymer'],
  trisiloxane: ['三硅氧烷', 'trisiloxane'],
  'tocopheryl-acetate': ['生育酚乙酸酯', '维生素e乙酸酯', '维生素e醋酸酯', 'tocopheryl acetate', 'vitamin e acetate'],
  adenosine: ['腺苷', 'adenosine'],
};

/** 归一化：小写、去括号/空格/中点，便于宽松比对。 */
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[（）()[\]【】]/g, '')
    .replace(/[\s　·•・*]/g, '')
    .trim();
}

interface Term {
  id: string;
  term: string;
  len: number;
}

// 预构建检索词表：每个成分的 nameCn + name + 别名，去重归一化。
const TERMS: Term[] = (() => {
  const out: Term[] = [];
  for (const ing of ingredients) {
    const seen = new Set<string>();
    for (const r of [ing.nameCn, ing.name, ...(INGREDIENT_ALIASES[ing.id] ?? [])]) {
      const t = norm(r);
      if (t && !seen.has(t)) {
        seen.add(t);
        out.push({ id: ing.id, term: t, len: t.length });
      }
    }
  }
  return out;
})();

export interface ParseResult {
  matched: Ingredient[];
  unmatched: string[];
}

/**
 * 解析成分表自由文本。每个词条取「最长命中词」对应的成分（更具体者优先，
 * 避免「甘油硬脂酸酯」误命中「甘油」）；命中需精确相等，或检索词≥3字且被词条包含。
 */
export function parseIngredientText(raw: string): ParseResult {
  const tokens = raw
    .split(/[,，、;；\n\r\t/／|]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const matchedIds = new Set<string>();
  const order: string[] = [];
  const unmatched: string[] = [];

  for (const token of tokens) {
    const nt = norm(token);
    if (!nt) continue;
    let bestId: string | null = null;
    let bestLen = 0;
    for (const { id, term, len } of TERMS) {
      const hit = nt === term || (len >= 3 && nt.includes(term));
      if (hit && len > bestLen) {
        bestLen = len;
        bestId = id;
      }
    }
    if (bestId) {
      if (!matchedIds.has(bestId)) {
        matchedIds.add(bestId);
        order.push(bestId);
      }
    } else if (!unmatched.includes(token)) {
      unmatched.push(token);
    }
  }

  const byId = new Map(ingredients.map((i) => [i.id, i]));
  const matched = order.map((id) => byId.get(id)).filter(Boolean) as Ingredient[];
  return { matched, unmatched };
}
