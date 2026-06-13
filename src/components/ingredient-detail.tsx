'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, X, Atom } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Ingredient } from '@/lib/mock-data';

interface IngredientDetailProps {
  ingredient: Ingredient;
  onClose: () => void;
}

export function IngredientDetail({ ingredient, onClose }: IngredientDetailProps) {
  const getSafetyConfig = (score: number) => {
    if (score >= 8) return { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: '安全' };
    if (score >= 5) return { icon: Shield, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: '注意' };
    return { icon: ShieldAlert, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', label: '风险' };
  };

  const safety = getSafetyConfig(ingredient.safetyScore);
  const SafetyIcon = safety.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-surface border border-border rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-white">{ingredient.nameCn}</h2>
              <p className="text-xs text-muted">{ingredient.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4 text-muted" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Safety Score */}
            <div className="flex items-center gap-4">
              <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center', safety.bg, safety.border, 'border')}>
                <SafetyIcon className={cn('w-6 h-6', safety.color)} />
              </div>
              <div>
                <p className="text-sm text-muted">安全评分</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{ingredient.safetyScore}</span>
                  <span className="text-sm text-muted">/ 10</span>
                  <span className={cn('badge', safety.bg, safety.color, safety.border)}>
                    {safety.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Category & Tags */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="badge bg-white/5 text-muted border border-border">
                  {ingredient.category}
                </span>
                {ingredient.functions.map((tag, i) => (
                  <span key={i} className="badge bg-primary/10 text-primary border border-primary/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">成分说明</h4>
              <p className="text-sm text-muted leading-relaxed">{ingredient.description}</p>
            </div>

            {/* Chemical Structure Placeholder */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">化学结构</h4>
              <div className="aspect-[2/1] bg-surface-hover rounded-lg border border-border flex items-center justify-center gap-2">
                <Atom className="w-5 h-5 text-muted" />
                <span className="text-sm text-muted">化学结构图加载中...</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
