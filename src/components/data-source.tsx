import { Database, ExternalLink, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Honest disclosure of where the data comes from and what the scores mean.
 * Plain <details> — zero JS, works without 'use client'. Copy is deliberately
 * candid: the ingredient dataset is AI-assisted curation; only the chemistry
 * (structures + formulas) is program-verified and externally checkable.
 */
export function DataSource({ className }: { className?: string }) {
  return (
    <details className={cn('group rounded-lg border border-border bg-surface-hover/50', className)}>
      <summary className="flex items-center justify-between gap-2 cursor-pointer list-none px-3 py-2.5 text-xs font-medium text-muted hover:text-white [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          数据来源与评分依据
        </span>
        <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-3 pb-3 pt-1 text-xs text-muted leading-relaxed space-y-2">
        <p>本成分数据库由 AI 辅助整理，仅供科普参考，不代表官方或临床数据。</p>
        <p>
          <span className="text-emerald-400">✓ 可验证：</span>
          化学结构图与分子式由 SMILES 经程序（smiles-drawer / openchemlib）实时生成与校验，可对照{' '}
          <a
            href="https://pubchem.ncbi.nlm.nih.gov"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-0.5"
          >
            PubChem
            <ExternalLink className="w-3 h-3" />
          </a>{' '}
          等公开化学数据库核对。
        </p>
        <p>
          <span className="text-amber-400">参考分级：</span>
          安全评分（0–10）为综合参考分级，非官方或监管评级；刺激性与孕期提示为通用参考，个体差异较大，请以专业建议为准。
        </p>
      </div>
    </details>
  );
}
