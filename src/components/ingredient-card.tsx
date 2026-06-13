'use client';

import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Ingredient } from '@/lib/mock-data';

interface IngredientCardProps {
  ingredient: Ingredient;
  index?: number;
}

function SafetyBadge({ score }: { score: number }) {
  const config =
    score >= 8
      ? { icon: ShieldCheck, className: 'badge-safe', label: '安全' }
      : score >= 5
        ? { icon: Shield, className: 'badge-warning', label: '注意' }
        : { icon: ShieldAlert, className: 'badge-danger', label: '风险' };

  const Icon = config.icon;

  return (
    <span className={cn('badge', config.className)}>
      <Icon className="w-3 h-3 mr-1" />
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
      className="card group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-white group-hover:text-primary transition-colors">
            {ingredient.nameCn}
          </h3>
          <p className="text-xs text-muted mt-0.5">{ingredient.name}</p>
        </div>
        <SafetyBadge score={ingredient.safetyScore} />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="badge bg-white/5 text-muted border border-border">
          {ingredient.category}
        </span>
        {ingredient.功效.map((tag, i) => (
          <span key={i} className="badge bg-primary/10 text-primary/80 border border-primary/20">
            {tag}
          </span>
        ))}
      </div>

      <p className="text-sm text-muted leading-relaxed line-clamp-2">
        {ingredient.description}
      </p>
    </motion.div>
  );
}
