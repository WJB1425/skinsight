'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Sun, Moon, Lightbulb, Plus, ArrowRight, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  GOALS,
  SEASONS,
  buildRoutine,
  currentSeasonId,
  type RoutineProduct,
  type RoutineStep,
} from '@/lib/routine';

interface RoutinePanelProps {
  products: RoutineProduct[];
  /** 当前月份 0-11，用于默认季节（父级用 new Date().getMonth() 传入，避免组件直接读时间）。 */
  month: number;
}

function StepList({ steps, empty }: { steps: RoutineStep[]; empty: string }) {
  if (steps.length === 0) return <p className="px-1 py-3 text-xs text-muted">{empty}</p>;
  return (
    <ol className="space-y-2">
      {steps.map((s, i) => (
        <li key={s.productId + i} className="flex gap-2.5">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
            {i + 1}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-medium text-foreground">
              <span className="text-muted">{s.slotLabel}：</span>
              {s.name}
            </p>
            {s.targets.length > 0 && (
              <p className="truncate text-[11px] text-muted">{s.targets.join(' · ')}</p>
            )}
            {s.reason && <p className="mt-0.5 text-[11px] text-amber-700">{s.reason}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function RoutinePanel({ products, month }: RoutinePanelProps) {
  const [seasonId, setSeasonId] = useState(() => currentSeasonId(month));
  const season = SEASONS.find((s) => s.id === seasonId)!;
  const [goalIds, setGoalIds] = useState<string[]>(season.goalIds);

  function pickSeason(id: string) {
    setSeasonId(id);
    const s = SEASONS.find((x) => x.id === id)!;
    setGoalIds(s.goalIds);
  }
  function toggleGoal(id: string) {
    setGoalIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  const routine = useMemo(() => buildRoutine(products, goalIds), [products, goalIds]);

  return (
    <div className="card">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <CalendarDays className="h-4 w-4 text-primary" />
        按季节 / 目标的用法建议
      </h3>

      {/* 季节 */}
      <div className="mb-3 flex flex-wrap gap-2">
        {SEASONS.map((s) => (
          <button
            key={s.id}
            onClick={() => pickSeason(s.id)}
            className={cn('chip', seasonId === s.id ? 'chip-active' : 'chip-idle')}
          >
            {s.label}
          </button>
        ))}
      </div>
      <p className="mb-3 text-xs text-muted">{season.note}</p>

      {/* 目标 */}
      <p className="mb-1.5 text-xs font-semibold text-foreground">本季想达到的目标（可多选）</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => toggleGoal(g.id)}
            className={cn('chip', goalIds.includes(g.id) ? 'chip-active' : 'chip-idle')}
          >
            {g.label}
          </button>
        ))}
      </div>

      {/* 早 / 晚流程 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-3.5">
          <p className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-amber-700">
            <Sun className="h-4 w-4" />
            早晨
          </p>
          <StepList steps={routine.am} empty="暂无适合早晨的产品" />
        </div>
        <div className="rounded-xl border border-indigo-200/70 bg-indigo-50/40 p-3.5">
          <p className="mb-2.5 flex items-center gap-1.5 text-sm font-semibold text-indigo-700">
            <Moon className="h-4 w-4" />
            夜间
          </p>
          <StepList steps={routine.pm} empty="暂无适合夜间的产品" />
        </div>
      </div>

      {/* 缺口建议 */}
      {routine.gaps.length > 0 && (
        <div className="mt-4 rounded-xl border border-border bg-surface-hover p-3.5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Plus className="h-3.5 w-3.5 text-primary" />
            为达成目标，建议补充
          </p>
          <div className="space-y-1.5">
            {routine.gaps.map((g) => (
              <div key={g.goal.id} className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="font-medium text-foreground">{g.goal.label}：</span>
                {g.suggestions.length > 0 ? (
                  g.suggestions.map((name) => (
                    <span key={name} className="badge border border-primary/20 bg-primary/10 text-primary">
                      {name}
                    </span>
                  ))
                ) : (
                  <span className="text-muted">参考成分库</span>
                )}
                <Link
                  href="/ingredients"
                  className="inline-flex items-center gap-0.5 text-primary hover:underline"
                >
                  去了解 <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 用法提示 */}
      {routine.tips.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
            用法提示
          </p>
          <ul className="space-y-1.5">
            {routine.tips.map((t, i) => (
              <li key={i} className="flex gap-1.5 text-xs leading-normal text-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-dark" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
