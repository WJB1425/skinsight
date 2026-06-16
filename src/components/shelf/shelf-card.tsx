'use client';

import { motion } from 'framer-motion';
import { Trash2, ScanLine, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIngredientById, type Ingredient } from '@/lib/mock-data';
import type { ShelfItem } from '@/lib/shelf';

interface ShelfCardProps {
  item: ShelfItem;
  index?: number;
  onRemove: (id: string) => void;
  onIngredientClick: (ing: Ingredient) => void;
}

const CAT_STYLE: Record<string, string> = {
  精华: 'bg-sky-500/10 text-sky-700 border-sky-500/25',
  乳液: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25',
  面霜: 'bg-amber-500/10 text-amber-700 border-amber-500/25',
  爽肤水: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/25',
  洁面: 'bg-violet-500/10 text-violet-700 border-violet-500/25',
};
const CAT_DEFAULT = 'bg-slate-500/10 text-slate-700 border-slate-500/25';

export function ShelfCard({ item, index = 0, onRemove, onIngredientClick }: ShelfCardProps) {
  const ingredients = item.ingredientIds
    .map((id) => getIngredientById(id))
    .filter(Boolean) as Ingredient[];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.05, 0.3), duration: 0.35 }}
      className="card flex h-full flex-col p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{item.name}</h3>
          <p className="mt-0.5 truncate text-[11px] text-muted">
            {item.brandCn ? `${item.brandCn} · ` : ''}
            {ingredients.length} 种成分
          </p>
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="shrink-0 rounded-lg p-1.5 text-muted-dark transition-colors hover:bg-red-50 hover:text-red-500"
          aria-label="移除"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span
          className={cn(
            'rounded-md border px-2 py-0.5 text-[10px] font-semibold',
            item.category ? CAT_STYLE[item.category] ?? CAT_DEFAULT : CAT_DEFAULT,
          )}
        >
          {item.category ?? '未分类'}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-hover px-2 py-0.5 text-[10px] font-medium text-muted">
          {item.source === 'scan' ? (
            <>
              <ScanLine className="h-2.5 w-2.5" />识别成分表
            </>
          ) : (
            <>
              <Package className="h-2.5 w-2.5" />产品库
            </>
          )}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {ingredients.length === 0 && (
          <span className="text-xs text-muted-dark">未识别到收录成分</span>
        )}
        {ingredients.map((ing) => (
          <button
            key={ing.id}
            onClick={() => onIngredientClick(ing)}
            className="badge border border-primary/20 bg-primary/10 text-primary transition-colors hover:bg-primary/20"
          >
            {ing.nameCn}
          </button>
        ))}
      </div>
    </motion.div>
  );
}
