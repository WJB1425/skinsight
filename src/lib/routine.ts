// 配伍分析 & 用法推荐引擎（纯函数，全部基于既有 curated 数据集真算）。
//
// 输入是用户护肤台里的产品（每个带成分 id 列表），输出：
//  - analyzeShelf：去重成分、配伍冲突（复用 checkConflicts）、目标覆盖度、安全提示
//  - buildRoutine：按季节/目标生成早晚流程（含早C晚A拆分）、缺口与用法提示

import {
  ingredients,
  getIngredientById,
  checkConflicts,
  type Ingredient,
  type ConflictRule,
} from './mock-data';

// ==================== 目标 / 季节配置 ====================
export interface Goal {
  id: string;
  label: string;
  /** 命中 ingredient.functions 里包含这些关键词之一即算覆盖（含「协同」的功效不计入）。 */
  keywords: string[];
}

export const GOALS: Goal[] = [
  { id: 'sun', label: '防晒', keywords: ['防晒', 'UVA', 'UVB', '广谱'] },
  { id: 'brighten', label: '美白提亮', keywords: ['美白', '提亮', '淡斑'] },
  { id: 'hydrate', label: '保湿', keywords: ['保湿', '补水'] },
  { id: 'antiage', label: '抗老抗氧', keywords: ['抗衰', '抗老', '促进胶原', '紧致', '糖胺聚糖', '抗氧化', '抗糖'] },
  { id: 'soothe', label: '舒缓抗炎', keywords: ['舒缓', '抗炎', '镇静'] },
  { id: 'oil', label: '控油', keywords: ['控油', '吸油', '调节皮脂'] },
];

export const getGoalById = (id: string) => GOALS.find((g) => g.id === id);

export interface Season {
  id: string;
  label: string;
  goalIds: string[];
  note: string;
}

export const SEASONS: Season[] = [
  { id: 'spring', label: '春季', goalIds: ['hydrate', 'soothe', 'brighten'], note: '换季屏障易波动，以温和补水修护为主，逐步加强防晒。' },
  { id: 'summer', label: '夏季', goalIds: ['sun', 'oil', 'brighten'], note: '紫外线强、出油多：防晒打底，控油，对抗晒黑暗沉。' },
  { id: 'autumn', label: '秋季', goalIds: ['hydrate', 'antiage', 'brighten'], note: '风干物燥：加强补水，开始抗老，延续提亮。' },
  { id: 'winter', label: '冬季', goalIds: ['hydrate', 'soothe', 'antiage'], note: '干冷易紧绷泛红：强化保湿与屏障，温和抗老。' },
];

/** 由月份(0-11)推断当前季节 id（北半球）。 */
export function currentSeasonId(month: number): string {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

// ==================== 输入类型（与 shelf.ts 的 ShelfItem 兼容子集）====================
export interface RoutineProduct {
  id: string;
  name: string;
  category?: string;
  ingredientIds: string[];
}

// ==================== 成分功效 → 目标判定 ====================
function ingredientServesGoal(ing: Ingredient, goal: Goal): boolean {
  return ing.functions.some(
    (fn) => !fn.includes('协同') && goal.keywords.some((k) => fn.includes(k)),
  );
}

// 早晚归属用的成分集合
const SUN_FILTER_IDS = ['titanium-dioxide', 'zinc-oxide', 'octocrylene', 'avobenzone', 'tinosorb-s'];
const PM_ACTIVE_IDS = ['retinol', 'retinal', 'bakuchiol', 'salicylic-acid', 'glycolic-acid', 'lactic-acid', 'mandelic-acid'];
const AM_ACTIVE_IDS = ['vitamin-c'];

// 品类 → 早晚流程步骤顺序
function categorySlot(category?: string): { order: number; label: string } {
  const c = category ?? '';
  if (c.includes('洁面') || c.includes('清洁')) return { order: 0, label: '洁面' };
  if (c.includes('水') || c.includes('露') && c.includes('爽肤')) return { order: 1, label: '爽肤水' };
  if (c.includes('精华') || c.includes('原液') || c.includes('安瓶')) return { order: 2, label: '精华' };
  if (c.includes('乳')) return { order: 3, label: '乳液' };
  if (c.includes('霜') || c.includes('面霜')) return { order: 4, label: '面霜' };
  if (c.includes('防晒') || c.includes('隔离')) return { order: 5, label: '防晒' };
  return { order: 2, label: c || '精华 / 未分类' };
}

// ==================== analyzeShelf ====================
export interface IngredientRef {
  ingredient: Ingredient;
  productNames: string[];
}
export interface GoalCoverage {
  goal: Goal;
  covered: boolean;
  ingredientNames: string[];
  productNames: string[];
}
export interface ShelfConflict {
  rule: ConflictRule;
  productNames: string[];
}
export interface ShelfCaution {
  ingredient: Ingredient;
  reasons: string[];
}
export interface ShelfAnalysis {
  ingredientRefs: IngredientRef[];
  allIngredientIds: string[];
  conflicts: ShelfConflict[];
  coverage: GoalCoverage[];
  cautions: ShelfCaution[];
}

export function analyzeShelf(products: RoutineProduct[]): ShelfAnalysis {
  // 成分 → 含它的产品名
  const idToProducts = new Map<string, string[]>();
  for (const p of products) {
    for (const id of p.ingredientIds) {
      const arr = idToProducts.get(id) ?? [];
      if (!arr.includes(p.name)) arr.push(p.name);
      idToProducts.set(id, arr);
    }
  }

  const allIngredientIds = Array.from(idToProducts.keys());

  const ingredientRefs: IngredientRef[] = allIngredientIds
    .map((id) => {
      const ingredient = getIngredientById(id);
      return ingredient ? { ingredient, productNames: idToProducts.get(id)! } : null;
    })
    .filter(Boolean) as IngredientRef[];

  // 冲突：在成分并集上求规则命中，并标出涉及的产品
  const conflicts: ShelfConflict[] = checkConflicts(allIngredientIds).map((rule) => {
    const names = new Set<string>();
    for (const p of products) {
      if (p.ingredientIds.some((id) => rule.ingredients.includes(id))) names.add(p.name);
    }
    return { rule, productNames: Array.from(names) };
  });

  // 目标覆盖度
  const coverage: GoalCoverage[] = GOALS.map((goal) => {
    const ingNames: string[] = [];
    const prodNames = new Set<string>();
    for (const ref of ingredientRefs) {
      if (ingredientServesGoal(ref.ingredient, goal)) {
        ingNames.push(ref.ingredient.nameCn);
        ref.productNames.forEach((n) => prodNames.add(n));
      }
    }
    return {
      goal,
      covered: ingNames.length > 0,
      ingredientNames: ingNames,
      productNames: Array.from(prodNames),
    };
  });

  // 安全提示：孕期慎用 / 高刺激
  const cautions: ShelfCaution[] = ingredientRefs
    .map(({ ingredient }) => {
      const reasons: string[] = [];
      if (!ingredient.pregnantSafe) reasons.push('孕期慎用 / 避免');
      if (ingredient.irritationRisk === 'high') reasons.push('刺激性高');
      return reasons.length ? { ingredient, reasons } : null;
    })
    .filter(Boolean) as ShelfCaution[];

  return { ingredientRefs, allIngredientIds, conflicts, coverage, cautions };
}

// ==================== buildRoutine ====================
export interface RoutineStep {
  productId: string;
  name: string;
  slotLabel: string;
  order: number;
  targets: string[]; // 命中的目标 label
  reason: string;
}
export interface GoalGap {
  goal: Goal;
  suggestions: string[]; // 推荐补充的成分中文名
}
export interface Routine {
  am: RoutineStep[];
  pm: RoutineStep[];
  gaps: GoalGap[];
  tips: string[];
}

function productTargets(p: RoutineProduct): string[] {
  const labels = new Set<string>();
  for (const id of p.ingredientIds) {
    const ing = getIngredientById(id);
    if (!ing) continue;
    for (const goal of GOALS) if (ingredientServesGoal(ing, goal)) labels.add(goal.label);
  }
  return Array.from(labels);
}

/** 决定一个产品出现在早 / 晚 / 早晚。 */
function placement(p: RoutineProduct): { am: boolean; pm: boolean; reason: string } {
  const ids = p.ingredientIds;
  if (ids.some((id) => SUN_FILTER_IDS.includes(id)) || (p.category ?? '').includes('防晒'))
    return { am: true, pm: false, reason: '日间防晒，出门前涂抹' };
  if (ids.some((id) => PM_ACTIVE_IDS.includes(id)))
    return { am: false, pm: true, reason: '夜间使用，避免光敏；次日加强防晒' };
  if (ids.some((id) => AM_ACTIVE_IDS.includes(id)))
    return { am: true, pm: false, reason: '早晨抗氧化，配合防晒效果更佳' };
  return { am: true, pm: true, reason: '早晚均可' };
}

export function buildRoutine(products: RoutineProduct[], selectedGoalIds: string[]): Routine {
  const toStep = (p: RoutineProduct, reason: string): RoutineStep => {
    const slot = categorySlot(p.category);
    return {
      productId: p.id,
      name: p.name,
      slotLabel: slot.label,
      order: slot.order,
      targets: productTargets(p),
      reason,
    };
  };

  const am: RoutineStep[] = [];
  const pm: RoutineStep[] = [];
  for (const p of products) {
    const place = placement(p);
    if (place.am) am.push(toStep(p, place.am && place.pm ? '' : place.reason));
    if (place.pm) pm.push(toStep(p, place.am && place.pm ? '' : place.reason));
  }
  am.sort((a, b) => a.order - b.order);
  pm.sort((a, b) => a.order - b.order);

  // 缺口：选中但护肤台未覆盖的目标 → 从成分库推荐几个补充成分
  const analysis = analyzeShelf(products);
  const coveredGoalIds = new Set(analysis.coverage.filter((c) => c.covered).map((c) => c.goal.id));
  const gaps: GoalGap[] = selectedGoalIds
    .filter((gid) => !coveredGoalIds.has(gid))
    .map((gid) => {
      const goal = getGoalById(gid)!;
      const suggestions = ingredients
        .filter((ing) => ing.safetyScore >= 7 && ingredientServesGoal(ing, goal))
        .slice(0, 3)
        .map((ing) => ing.nameCn);
      return { goal, suggestions };
    })
    .filter((g) => Boolean(g.goal));

  // 用法提示
  const tips: string[] = [];
  const allIds = analysis.allIngredientIds;
  const hasPMActive = allIds.some((id) => PM_ACTIVE_IDS.includes(id));
  const hasVitC = allIds.some((id) => AM_ACTIVE_IDS.includes(id));
  const hasSun = allIds.some((id) => SUN_FILTER_IDS.includes(id)) || products.some((p) => (p.category ?? '').includes('防晒'));

  if (hasVitC && hasPMActive) tips.push('维 C 与 A 醇 / 酸类建议早晚分开使用（早 C 晚 A），减少叠加刺激。');
  if (hasPMActive) tips.push('含 A 醇 / 酸类：从低浓度低频率开始建立耐受，仅夜间使用，白天务必加强防晒。');
  if (!hasSun) tips.push('日间护肤建议以防晒收尾——当前护肤台还没有防晒产品。');
  if (analysis.cautions.some((c) => c.reasons.includes('孕期慎用 / 避免')))
    tips.push('护肤台含孕期慎用成分，孕期 / 备孕请先咨询医生。');
  // 把冲突建议并入提示（去重）
  for (const c of analysis.conflicts) {
    if (c.rule.advice && !tips.includes(c.rule.advice)) tips.push(c.rule.advice);
  }

  return { am, pm, gaps, tips };
}
