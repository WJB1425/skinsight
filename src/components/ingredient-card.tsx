'use client';

import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSafetyLevel } from '@/lib/safety';
import { MoleculeThumb } from '@/components/molecule-viewer';
import type { Ingredient } from '@/lib/mock-data';

interface IngredientCardProps {
  ingredient: Ingredient;
  index?: number;
  onClick?: () => void;
}

const SAFETY_ICON = { safe: ShieldCheck, caution: Shield, risk: ShieldAlert };

function SafetyBadge({ score }: { score: number }) {
  const config = getSafetyLevel(score);
  const Icon = SAFETY_ICON[config.level];

  return (
    <span className={cn('badge shrink-0', config.badgeClass)}>
      <Icon className="mr-1 h-3 w-3" />
      {config.label} {score}/10
    </span>
  );
}

export function IngredientCard({ ingredient, index = 0, onClick }: IngredientCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.35 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="card group h-full cursor-pointer p-3.5"
    >
      {/* Live-rendered 2D structure, floated so the title wraps around it. */}
      {ingredient.smiles?.trim() && (
        <span className="float-right ml-2.5 mb-0.5">
          <MoleculeThumb smiles={ingredient.smiles} />
        </span>
      )}

      <h3 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
        {ingredient.nameCn}
      </h3>
      <p className="truncate text-[11px] text-muted">{ingredient.name}</p>

      <div className="clear-both mt-[11px] flex min-w-0 flex-nowrap items-center gap-1.5">
        <SafetyBadge score={ingredient.safetyScore} />
        {ingredient.functions[0] && (
          <span className="badge shrink-0 border border-border bg-surface-hover text-muted">
            {ingredient.functions[0]}
          </span>
        )}
      </div>
    </motion.div>
  );
}
