// Shared safety-presentation logic, so the ingredient card and detail modal
// stay consistent. Pure (no React/icon imports) — components map level -> icon.

export type SafetyLevel = 'safe' | 'caution' | 'risk';

export interface SafetyConfig {
  level: SafetyLevel;
  label: string;
  color: string;
  bg: string;
  border: string;
  badgeClass: string;
}

/** Map a 0–10 safety score to its presentation config. Thresholds: >=8 安全, >=5 注意, else 风险. */
export function getSafetyLevel(score: number): SafetyConfig {
  if (score >= 8) {
    return { level: 'safe', label: '安全', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', badgeClass: 'badge-safe' };
  }
  if (score >= 5) {
    return { level: 'caution', label: '注意', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', badgeClass: 'badge-warning' };
  }
  return { level: 'risk', label: '风险', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', badgeClass: 'badge-danger' };
}

export type IrritationRisk = 'low' | 'medium' | 'high';

/** Irritation risk -> Chinese label + badge variant. */
export function getIrritationConfig(risk: IrritationRisk): { label: string; badgeClass: string } {
  if (risk === 'low') return { label: '刺激性低', badgeClass: 'badge-safe' };
  if (risk === 'medium') return { label: '刺激性中等', badgeClass: 'badge-warning' };
  return { label: '刺激性高', badgeClass: 'badge-danger' };
}

/** Pregnancy-use flag -> Chinese label + badge variant. */
export function getPregnancyConfig(safe: boolean): { label: string; badgeClass: string } {
  return safe
    ? { label: '孕期可用（参考）', badgeClass: 'badge-safe' }
    : { label: '孕期慎用 / 避免', badgeClass: 'badge-danger' };
}
