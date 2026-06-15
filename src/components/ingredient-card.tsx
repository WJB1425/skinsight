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

export function IngredientCard({ ingredient, index = 0 }: IngredientCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -4 }}
      className="card group cursor-pointer p-3.5"
    >
      {/* Live-rendered 2D structure, floated so the title wraps around it. */}
      {ingredient.smiles?.trim() && (
        <span className="float-right ml-2.5">
          <MoleculeThumb smiles={ingredient.smiles} />
        </span>
      )}

      <h3 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
        {ingredient.nameCn}
      </h3>
      <p className="truncate text-[11px] text-muted">{ingredient.name}</p>

      <div className="clear-both flex flex-wrap items-center gap-1.5 pt-3">
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
