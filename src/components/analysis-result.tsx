'use client';

import { motion } from 'framer-motion';
import { Droplets, Flame, AlertTriangle, Check } from 'lucide-react';
import type { SkinAnalysisResult } from '@/lib/mock-data';

interface AnalysisResultProps {
  result: SkinAnalysisResult;
}

function ProgressBar({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm text-muted">{label}</span>
        </div>
        <span className="text-sm font-semibold text-foreground">{value}%</span>
      </div>
      <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
        />
      </div>
    </div>
  );
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  const skinTypeIcons: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
    dry: { icon: Droplets, color: 'text-blue-500' },
    oily: { icon: Flame, color: 'text-amber-500' },
    combination: { icon: AlertTriangle, color: 'text-violet-500' },
    sensitive: { icon: AlertTriangle, color: 'text-red-500' },
    normal: { icon: Check, color: 'text-emerald-500' },
  };

  const typeConfig = skinTypeIcons[result.skinType] || skinTypeIcons.normal;
  const TypeIcon = typeConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="space-y-6"
    >
      {/* Skin Type */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/15 to-violet-500/15 ring-1 ring-inset ring-border flex items-center justify-center`}>
            <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">肤质类型</p>
            <h3 className="text-xl font-bold text-foreground">{result.skinTypeCn}</h3>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="card space-y-5">
        <h4 className="text-sm font-semibold text-foreground mb-4">肤质指标</h4>
        <ProgressBar label="水分度" value={result.moisture} icon={Droplets} color="text-blue-500" />
        <ProgressBar label="油脂度" value={result.oiliness} icon={Flame} color="text-amber-500" />
        <ProgressBar label="敏感度" value={result.sensitivity} icon={AlertTriangle} color="text-red-500" />
      </div>

      {/* Concerns */}
      <div className="card">
        <h4 className="text-sm font-semibold text-foreground mb-3">关注问题</h4>
        <div className="flex flex-wrap gap-2">
          {result.concerns.map((concern, i) => (
            <span
              key={i}
              className="badge bg-amber-50 text-amber-700 border border-amber-200/80"
            >
              {concern}
            </span>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h4 className="text-sm font-semibold text-foreground mb-3">推荐成分</h4>
        <div className="flex flex-wrap gap-2">
          {result.recommendedIngredients.map((ing, i) => (
            <span
              key={i}
              className="badge bg-primary/10 text-primary border border-primary/20"
            >
              {ing}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
