'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  FlaskConical,
  GitCompare,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Lightbulb,
} from 'lucide-react';
import { IngredientCard } from '@/components/ingredient-card';
import { IngredientDetail } from '@/components/ingredient-detail';
import { ingredients, conflictRules, getIngredientById } from '@/lib/mock-data';
import type { Ingredient, ConflictRule } from '@/lib/mock-data';
import { INGREDIENT_GROUPS, getCategoryGroup } from '@/lib/categories';

// Severity → presentation for the conflict-reference rail.
const SEV = {
  safe: {
    Icon: CheckCircle2,
    label: '可搭配',
    chip: 'bg-emerald-50 border-emerald-200',
    icon: 'text-emerald-600',
    fg: 'text-emerald-700',
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  warning: {
    Icon: AlertTriangle,
    label: '注意',
    chip: 'bg-amber-50 border-amber-200',
    icon: 'text-amber-600',
    fg: 'text-amber-700',
    pill: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  danger: {
    Icon: XCircle,
    label: '冲突',
    chip: 'bg-red-50 border-red-200',
    icon: 'text-red-500',
    fg: 'text-red-600',
    pill: 'bg-red-50 text-red-600 border-red-200',
  },
} as const;

const nameOf = (id: string) => getIngredientById(id)?.nameCn ?? id;

function ConflictRow({ rule, first }: { rule: ConflictRule; first: boolean }) {
  const c = SEV[rule.severity] ?? SEV.warning;
  return (
    <div className={`flex gap-2.5 px-4 py-3.5 ${first ? '' : 'border-t border-border'}`}>
      <span
        className={`mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg border ${c.chip}`}
      >
        <c.Icon className={`h-3.5 w-3.5 ${c.icon}`} />
      </span>
      <div className="min-w-0">
        <div className="mb-[3px] flex flex-wrap items-center gap-1.5">
          <span className="text-[13px] font-semibold text-foreground">
            {rule.ingredients.map(nameOf).join(' + ')}
          </span>
          <span
            className={`rounded-full border px-[7px] py-px text-[11px] font-semibold ${c.pill}`}
          >
            {c.label}
          </span>
        </div>
        <p className="text-xs leading-normal text-muted">{rule.message}</p>
        {rule.advice && (
          <p className={`mt-1.5 flex items-center gap-1.5 text-xs font-medium ${c.fg}`}>
            <Lightbulb className={`h-3 w-3 shrink-0 ${c.icon}`} />
            {rule.advice}
          </p>
        )}
      </div>
    </div>
  );
}

export default function IngredientsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  // Collapse the 30+ granular categories into the high-level groups that
  // actually have ingredients (skip empty ones so there are no dead chips).
  const groups = useMemo(() => {
    const present = new Set(ingredients.map((i) => getCategoryGroup(i.category)));
    return [
      { id: 'all', label: '全部' },
      ...INGREDIENT_GROUPS.filter((g) => present.has(g.id)),
    ];
  }, []);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchesSearch =
        ing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ing.nameCn.includes(searchQuery);
      const matchesGroup =
        selectedGroup === 'all' || getCategoryGroup(ing.category) === selectedGroup;
      return matchesSearch && matchesGroup;
    });
  }, [searchQuery, selectedGroup]);

  return (
    <div className="container-app py-8 sm:py-10">
      {/* Header — compact, left-aligned */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex items-center gap-3.5"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-violet-500/[0.12] ring-1 ring-inset ring-border">
          <FlaskConical className="h-[22px] w-[22px] text-violet-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold leading-tight tracking-tight">成分分析</h1>
          <p className="mt-0.5 text-sm text-muted">
            查询成分的安全性与功效，做出更明智的护肤选择
          </p>
        </div>
      </motion.div>

      {/* Two-column explorer */}
      <div className="ss-ing-body">
        {/* Main — search, filters, grid */}
        <div>
          <div className="mb-3.5 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="搜索成分名称（支持中英文）..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-base pl-10 pr-4"
              />
            </div>
            <span className="shrink-0 whitespace-nowrap text-sm text-muted">
              找到 <span className="font-semibold text-foreground">{filteredIngredients.length}</span> 个成分
            </span>
          </div>

          <div className="mb-[18px] flex flex-wrap gap-2">
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g.id)}
                className={`chip ${selectedGroup === g.id ? 'chip-active' : 'chip-idle'}`}
              >
                {g.label}
              </button>
            ))}
          </div>

          {filteredIngredients.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border px-6 py-12 text-center text-muted-dark">
              <Search className="mx-auto mb-2.5 h-6 w-6" />
              <p className="text-sm">没有匹配的成分，换个关键词或筛选试试</p>
            </div>
          ) : (
            <div className="ss-ing-grid">
              {filteredIngredients.map((ingredient, index) => (
                <IngredientCard
                  key={ingredient.id}
                  ingredient={ingredient}
                  index={index}
                  onClick={() => setSelectedIngredient(ingredient)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Aside — sticky conflict reference rail */}
        <aside className="ss-ing-aside">
          <div className="card overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3.5">
              <GitCompare className="h-4 w-4 text-violet-600" />
              <span className="text-sm font-semibold text-foreground">搭配冲突参考</span>
              <span className="badge ml-auto border border-border bg-surface-hover text-muted">
                {conflictRules.length}
              </span>
            </div>
            <div className="flex flex-col">
              {conflictRules.map((rule, i) => (
                <ConflictRow key={i} rule={rule} first={i === 0} />
              ))}
            </div>
          </div>
          <p className="mx-1 mt-3 flex items-start gap-1.5 text-[11px] leading-normal text-muted-dark">
            <Info className="mt-px h-3 w-3 shrink-0" />
            <span>冲突分级为综合参考，非监管评级，仅供日常护肤参考。</span>
          </p>
        </aside>
      </div>

      {/* Detail Modal */}
      {selectedIngredient && (
        <IngredientDetail
          ingredient={selectedIngredient}
          onClose={() => setSelectedIngredient(null)}
        />
      )}
    </div>
  );
}
