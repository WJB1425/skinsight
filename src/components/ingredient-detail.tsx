'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, X, Atom } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSafetyLevel, getIrritationConfig, getPregnancyConfig } from '@/lib/safety';
import { MoleculeViewer } from '@/components/molecule-viewer';
import { DataSource } from '@/components/data-source';
import { MedicalDisclaimer } from '@/components/medical-disclaimer';
import type { Ingredient } from '@/lib/mock-data';

interface IngredientDetailProps {
  ingredient: Ingredient;
  onClose: () => void;
}

const SAFETY_ICON = { safe: ShieldCheck, caution: Shield, risk: ShieldAlert };

/** Render a molecular formula with subscript digits, e.g. C6H6N2O -> C₆H₆N₂O. */
function FormulaText({ formula }: { formula: string }) {
  return (
    <>
      {formula.split(/(\d+)/).map((part, i) =>
        /^\d+$/.test(part) ? <sub key={i}>{part}</sub> : <span key={i}>{part}</span>,
      )}
    </>
  );
}

export function IngredientDetail({ ingredient, onClose }: IngredientDetailProps) {
  const safety = getSafetyLevel(ingredient.safetyScore);
  const SafetyIcon = SAFETY_ICON[safety.level];
  const irritation = getIrritationConfig(ingredient.irritationRisk);
  const pregnancy = getPregnancyConfig(ingredient.pregnantSafe);

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
          className="w-full max-w-lg bg-surface border border-border rounded-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
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

          <div className="p-5 space-y-5 overflow-y-auto">
            {/* Safety Score */}
            <div>
              <div className="flex items-center gap-4">
                <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center border', safety.bg, safety.border)}>
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
              <p className="text-[11px] text-muted-dark mt-2">
                综合参考分级，非官方或监管评级，仅供科普参考。
              </p>
            </div>

            {/* Safety hints — surfaced from real data fields */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">安全提示</h4>
              <div className="flex flex-wrap gap-2">
                <span className={cn('badge', irritation.badgeClass)}>{irritation.label}</span>
                <span className={cn('badge', pregnancy.badgeClass)}>{pregnancy.label}</span>
              </div>
            </div>

            {/* Category & Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="badge bg-white/5 text-muted border border-border">
                {ingredient.category}
              </span>
              {ingredient.functions.map((tag, i) => (
                <span key={i} className="badge bg-primary/10 text-primary border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">成分说明</h4>
              <p className="text-sm text-muted leading-relaxed">{ingredient.description}</p>
            </div>

            {/* Chemical Structure */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <Atom className="w-4 h-4 text-accent" />
                化学结构
              </h4>
              <MoleculeViewer smiles={ingredient.smiles} name={ingredient.nameCn} />
              {ingredient.formula && (
                <p className="mt-2 text-sm text-white">
                  分子式：<span className="font-mono"><FormulaText formula={ingredient.formula} /></span>
                </p>
              )}
              {ingredient.smiles && (
                <p className="mt-1 font-mono text-[11px] text-muted-dark break-all leading-relaxed">
                  SMILES: {ingredient.smiles}
                </p>
              )}
            </div>

            {/* Data source / methodology disclosure */}
            <DataSource />

            {/* Disclaimer */}
            <MedicalDisclaimer />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
