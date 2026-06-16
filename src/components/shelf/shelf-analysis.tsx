'use client';

import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Circle,
  Lightbulb,
  GitCompare,
  ShieldAlert,
  Target,
} from 'lucide-react';
import type { ShelfAnalysis } from '@/lib/routine';

// 与「成分分析」页一致的冲突分级配色
const SEV = {
  safe: { Icon: CheckCircle2, label: '可搭配', chip: 'bg-emerald-50 border-emerald-200', icon: 'text-emerald-600', fg: 'text-emerald-700', pill: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  warning: { Icon: AlertTriangle, label: '注意', chip: 'bg-amber-50 border-amber-200', icon: 'text-amber-600', fg: 'text-amber-700', pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  danger: { Icon: XCircle, label: '冲突', chip: 'bg-red-50 border-red-200', icon: 'text-red-500', fg: 'text-red-600', pill: 'bg-red-50 text-red-600 border-red-200' },
} as const;

interface ShelfAnalysisViewProps {
  analysis: ShelfAnalysis;
  itemCount: number;
}

export function ShelfAnalysisView({ analysis, itemCount }: ShelfAnalysisViewProps) {
  const { coverage, conflicts, cautions } = analysis;

  return (
    <div className="space-y-4">
      {/* 目标覆盖度 */}
      <div className="card">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Target className="h-4 w-4 text-primary" />
          护肤目标覆盖
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {coverage.map((c) => (
            <div
              key={c.goal.id}
              className={`rounded-xl border px-3 py-2.5 ${
                c.covered ? 'border-emerald-200 bg-emerald-50/60' : 'border-border bg-surface-hover'
              }`}
            >
              <div className="flex items-center gap-1.5">
                {c.covered ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-dark" />
                )}
                <span
                  className={`text-xs font-semibold ${
                    c.covered ? 'text-emerald-700' : 'text-muted-dark'
                  }`}
                >
                  {c.goal.label}
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] text-muted" title={c.ingredientNames.join('、')}>
                {c.covered ? c.ingredientNames.join('、') : '暂无'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 配伍冲突 */}
      <div className="card">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <GitCompare className="h-4 w-4 text-violet-600" />
          配伍分析
        </h3>
        {itemCount < 2 ? (
          <p className="text-xs text-muted">再添加一个产品，即可分析成分之间能否搭配。</p>
        ) : conflicts.length === 0 ? (
          <p className="flex items-center gap-1.5 text-xs text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5" />
            当前产品成分之间未发现已知冲突，可放心搭配。
          </p>
        ) : (
          <div className="space-y-2.5">
            {conflicts.map((c, i) => {
              const s = SEV[c.rule.severity] ?? SEV.warning;
              return (
                <div key={i} className="flex gap-2.5">
                  <span
                    className={`mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg border ${s.chip}`}
                  >
                    <s.Icon className={`h-3.5 w-3.5 ${s.icon}`} />
                  </span>
                  <div className="min-w-0">
                    <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-[13px] font-semibold text-foreground">
                        {c.rule.ingredients
                          .map((id) => {
                            const ref = analysis.ingredientRefs.find((r) => r.ingredient.id === id);
                            return ref?.ingredient.nameCn ?? id;
                          })
                          .join(' + ')}
                      </span>
                      <span className={`rounded-full border px-[7px] py-px text-[11px] font-semibold ${s.pill}`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs leading-normal text-muted">{c.rule.message}</p>
                    {c.productNames.length > 0 && (
                      <p className="mt-0.5 text-[11px] text-muted-dark">
                        涉及：{c.productNames.join('、')}
                      </p>
                    )}
                    {c.rule.advice && (
                      <p className={`mt-1 flex items-center gap-1.5 text-xs font-medium ${s.fg}`}>
                        <Lightbulb className={`h-3 w-3 shrink-0 ${s.icon}`} />
                        {c.rule.advice}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 安全提示 */}
      {cautions.length > 0 && (
        <div className="card">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <ShieldAlert className="h-4 w-4 text-amber-600" />
            安全提示
          </h3>
          <div className="space-y-2">
            {cautions.map(({ ingredient, reasons }) => (
              <div key={ingredient.id} className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-medium text-foreground">{ingredient.nameCn}</span>
                {reasons.map((r) => (
                  <span key={r} className="badge badge-warning">
                    {r}
                  </span>
                ))}
              </div>
            ))}
          </div>
          <p className="mt-2.5 text-[11px] text-muted-dark">
            综合参考分级，非监管评级，仅供日常护肤参考。
          </p>
        </div>
      )}
    </div>
  );
}
