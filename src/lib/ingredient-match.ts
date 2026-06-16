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
  // —— 扩充批：基础 / 清洁 / 植物成分 ——
  'butylene-glycol': ['丁二醇', 'butylene glycol', 'butanediol'],
  'propylene-glycol': ['丙二醇', 'propylene glycol'],
  'pentylene-glycol': ['戊二醇', 'pentylene glycol', 'pentanediol'],
  betaine: ['甜菜碱', '三甲基甘氨酸', 'betaine', 'trimethylglycine'],
  urea: ['尿素', 'urea', 'carbamide'],
  'sodium-pca': ['pca钠', 'pca-na', '吡咯烷酮羧酸钠', 'sodium pca'],
  sorbitol: ['山梨醇', '山梨糖醇', 'sorbitol'],
  trehalose: ['海藻糖', 'trehalose'],
  'sodium-laureth-sulfate': ['月桂醇聚醚硫酸酯钠', '脂肪醇聚氧乙烯醚硫酸酯钠', '聚氧乙烯醚硫酸酯钠', '醇醚硫酸酯钠', 'sles', 'sodium laureth sulfate', 'laureth sulfate'],
  'cocamidopropyl-betaine': ['椰油酰胺丙基甜菜碱', 'capb', 'cocamidopropyl betaine'],
  'cocamidopropylamine-oxide': ['椰油酰胺丙基氧化胺', '氧化胺', 'cocamidopropylamine oxide', 'lauramine oxide'],
  'mes-sodium': ['脂肪酸甲酯磺酸钠', '甲酯磺酸钠', 'methyl ester sulfonate'],
  'coco-glucoside': ['椰油基葡糖苷', '癸基葡糖苷', '烷基糖苷', 'coco-glucoside', 'decyl glucoside'],
  'sodium-cocoyl-glycinate': ['椰油酰甘氨酸钠', '椰油酰基甘氨酸钠', 'sodium cocoyl glycinate'],
  'caprylic-capric-triglyceride': ['辛癸酸甘油三酯', '癸酸甘油三酯', '辛酸癸酸甘油三酯', 'caprylic capric triglyceride'],
  'shea-butter': ['乳木果油', '乳木果脂', '牛油果树果脂', 'shea butter', 'butyrospermum parkii'],
  'jojoba-oil': ['霍霍巴油', '荷荷巴油', '霍霍巴籽油', 'jojoba', 'simmondsia'],
  'orange-oil': ['甜橙油', '甜橙果皮油', '橙皮油', 'sweet orange oil', 'orange peel oil'],
  'lemon-oil': ['柠檬油', '柠檬果皮油', '柠檬皮油', 'lemon oil', 'lemon peel oil'],
  'sodium-benzoate': ['苯甲酸钠', 'sodium benzoate'],
  'potassium-sorbate': ['山梨酸钾', 'potassium sorbate'],
  'disodium-edta': ['edta二钠', '乙二胺四乙酸二钠', '依地酸二钠', 'disodium edta'],
  'citric-acid': ['柠檬酸', '枸橼酸', 'citric acid'],
  'xanthan-gum': ['黄原胶', '汉生胶', 'xanthan gum', 'xanthan'],
  carbomer: ['卡波姆', '卡波', 'carbomer'],
  caffeine: ['咖啡因', '咖啡碱', 'caffeine'],
  'aloe-vera': ['芦荟提取物', '库拉索芦荟', '库拉索芦荟叶提取物', 'aloe vera', 'aloe barbadensis'],
  'green-tea': ['绿茶提取物', '绿茶叶提取物', '茶叶提取物', 'green tea', 'camellia sinensis'],
  'dipotassium-glycyrrhizate': ['甘草酸二钾', '甘草酸钾', '甘草提取物', '甘草根提取物', 'dipotassium glycyrrhizate'],
  // —— 扩充批 2 ——
  galactomyces: ['半乳糖酵母样菌发酵产物滤液', '酵母提取物', '酵母滤液', '酵母发酵滤液', 'pitera', 'galactomyces', 'galactomyces ferment filtrate'],
  'hexylene-glycol': ['1,2-己二醇', '己二醇', 'hexylene glycol', 'hexanediol', '1,2-hexanediol'],
  hydroxyacetophenone: ['对羟基苯乙酮', '4-羟基苯乙酮', 'hydroxyacetophenone', '4-hydroxyacetophenone'],
  'sodium-citrate': ['柠檬酸钠', '枸橼酸钠', 'sodium citrate', 'trisodium citrate'],
  triethanolamine: ['三乙醇胺', 'triethanolamine'],
  'stearic-acid': ['硬脂酸', '十八酸', 'stearic acid'],
  'ethylhexyl-palmitate': ['棕榈酸乙基己酯', '棕榈酸异辛酯', 'ethylhexyl palmitate', 'octyl palmitate'],
  'peg-100-stearate': ['peg-100硬脂酸酯', 'peg-100 stearate', '聚乙二醇-100硬脂酸酯'],
  chlorphenesin: ['氯苯甘醚', 'chlorphenesin'],
  'garcinia-butter': ['印度藤黄籽脂', '印度藤黄籽油', '藤黄果籽脂', 'garcinia indica seed butter', 'kokum butter'],
  // —— 来自合作者 reference 资料 ——
  'benzophenone-3': ['二苯酮-3', '二苯酮3', '羟苯甲酮', '氧苯酮', 'benzophenone-3', 'oxybenzone'],
  'lauric-acid': ['月桂酸', '十二酸', 'lauric acid'],
  'myristic-acid': ['肉豆蔻酸', '十四酸', 'myristic acid'],
  'sodium-dodecylbenzenesulfonate': ['十二烷基苯磺酸钠', 'dodecylbenzene sulfonate', 'sdbs'],
  'cardanol-ether': ['腰果酚聚氧乙烯醚', '腰果酚', 'cardanol'],
  'carminic-acid': ['胭脂红酸', '胭脂红', '洋红', '胭脂虫红', 'carmine', 'carminic acid'],
  'superoxide-dismutase': ['超氧化物歧化酶', 'superoxide dismutase'],
};

// 日语 / 法语别名（与上表合并参与匹配）。覆盖常见成分，长尾可走「AI 规范化」兜底。
export const INGREDIENT_ALIASES_JP_FR: Record<string, string[]> = {
  'hyaluronic-acid': ['ヒアルロン酸', 'ヒアルロン酸na', 'ヒアルロン酸ナトリウム', 'acide hyaluronique', 'hyaluronate de sodium'],
  glycerin: ['グリセリン', 'glycérine', 'glycerine', 'glycérol'],
  ceramides: ['セラミド', 'セラミドnp', 'céramides', 'céramide'],
  squalane: ['スクワラン', 'squalane'],
  panthenol: ['パンテノール', 'panthénol'],
  niacinamide: ['ナイアシンアミド', 'ニコチン酸アミド', 'niacinamide'],
  'vitamin-c': ['アスコルビン酸', 'ビタミンc', 'acide ascorbique', 'vitamine c'],
  arbutin: ['アルブチン', 'arbutine'],
  'tranexamic-acid': ['トラネキサム酸', 'acide tranexamique'],
  retinol: ['レチノール', 'rétinol'],
  retinal: ['レチナール', 'rétinaldéhyde'],
  'salicylic-acid': ['サリチル酸', 'acide salicylique'],
  'glycolic-acid': ['グリコール酸', 'acide glycolique'],
  'lactic-acid': ['乳酸', 'acide lactique'],
  'mandelic-acid': ['マンデル酸', 'acide mandélique'],
  centella: ['ツボクサエキス', 'ツボクサ', 'シカ', 'centella'],
  allantoin: ['アラントイン', 'allantoïne'],
  'vitamin-e': ['トコフェロール', 'ビタミンe', 'tocophérol', 'vitamine e'],
  adenosine: ['アデノシン', 'adénosine'],
  dimethicone: ['ジメチコン', 'diméthicone'],
  phenoxyethanol: ['フェノキシエタノール', 'phénoxyéthanol'],
  fragrance: ['香料', 'parfum'],
  'butylene-glycol': ['ブチレングリコール', 'butylène glycol'],
  'propylene-glycol': ['プロピレングリコール', 'propylène glycol'],
  'pentylene-glycol': ['ペンチレングリコール', 'pentylène glycol'],
  betaine: ['ベタイン', 'bétaïne'],
  'citric-acid': ['クエン酸', 'acide citrique'],
  'sodium-citrate': ['クエン酸na', 'クエン酸ナトリウム', 'citrate de sodium'],
  'titanium-dioxide': ['酸化チタン', 'dioxyde de titane'],
  'zinc-oxide': ['酸化亜鉛', 'oxyde de zinc'],
  carbomer: ['カルボマー', 'carbomère'],
  'xanthan-gum': ['キサンタンガム', 'gomme xanthane'],
  'tocopheryl-acetate': ['酢酸トコフェロール', 'トコフェリルアセテート', 'acétate de tocophérol'],
  'sodium-benzoate': ['安息香酸na', '安息香酸ナトリウム', 'benzoate de sodium'],
  'potassium-sorbate': ['ソルビン酸k', 'sorbate de potassium'],
  ethylhexylglycerin: ['エチルヘキシルグリセリン', 'éthylhexylglycérine'],
  'stearic-acid': ['ステアリン酸', 'acide stéarique'],
  triethanolamine: ['トリエタノールアミン', 'triéthanolamine'],
  'disodium-edta': ['edta-2na', 'エデト酸塩', 'edta disodique'],
  'aloe-vera': ['アロエベラ', 'アロエ', 'aloe vera'],
  'hexylene-glycol': ['ヘキサンジオール', 'hexanediol'],
};

/** 归一化：全角转半角、小写、去括号/空格/中点，便于中日法文宽松比对。 */
function norm(s: string): string {
  return s
    .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)) // 全角字母数字 → 半角
    .toLowerCase()
    .replace(/[（）()[\]【】]/g, '')
    .replace(/[\s　·•・*]/g, '')
    .trim();
}

// 非成分噪声（水、分节小标题等）——按归一化后精确匹配直接忽略，既不算命中也不算未收录。
const IGNORE = new Set(
  ['水', 'water', 'aqua', 'eau', '纯净水', '去离子水', '蒸馏水', '精制水', '天然提取物', '植物提取物', '表面活性剂', '活性成分', '其他成分', '其他微量成分', '主要成分', '全部成分'].map(
    (s) => s.toLowerCase().replace(/[\s　]/g, ''),
  ),
);

/** 去掉成分表常见的行首序号 / 项目符号，如「1.」「2、」「(a)」「a)」「•」「- 」。 */
function stripMarker(s: string): string {
  return s
    .replace(/^[\s　]*[（(]?[0-9０-９a-zA-Zⅰ-ⅹ一二三四五六七八九十]{1,3}[)）.、。:：]\s*/, '')
    .replace(/^[\s　]*[•·▪◦*\-—–]+\s*/, '')
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
    for (const r of [
      ing.nameCn,
      ing.name,
      ...(INGREDIENT_ALIASES[ing.id] ?? []),
      ...(INGREDIENT_ALIASES_JP_FR[ing.id] ?? []),
    ]) {
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
  // 按分隔符切词；半角逗号若夹在数字之间（如「1,2-己二醇」「1,3-丁二醇」）不拆分。
  const tokens = raw
    .split(/[，、・;；\n\r\t/／|]+|,(?!\s*\d)/)
    .map((t) => stripMarker(t.trim()))
    .filter(Boolean);

  const matchedIds = new Set<string>();
  const order: string[] = [];
  const unmatched: string[] = [];

  for (const token of tokens) {
    const nt = norm(token);
    if (!nt || IGNORE.has(nt)) continue;
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
