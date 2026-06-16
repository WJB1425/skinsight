'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { POLYMER_INFO } from '@/lib/categories';
import { StructureRender, type StructureState } from '@/components/molecule-render';

const POLYMER_BADGE = 'badge border border-indigo-200/80 bg-indigo-50 text-indigo-700';

/** A tall square bracket ([ or ]) drawn with borders; the right one carries the subscript. */
function Bracket({ side, subscript }: { side: 'left' | 'right'; subscript?: string }) {
  const isLeft = side === 'left';
  return (
    <span
      aria-hidden
      className={cn(
        'pointer-events-none absolute top-8 bottom-8 w-2.5 border-foreground/55',
        isLeft ? 'left-4 rounded-l-sm border-l-2 border-y-2' : 'right-4 rounded-r-sm border-r-2 border-y-2',
      )}
    >
      {!isLeft && subscript && (
        <span className="absolute -bottom-4 left-full ml-0.5 font-mono text-base font-semibold text-foreground/80">
          {subscript}
        </span>
      )}
    </span>
  );
}

/**
 * Detail-view structure for polymers: shows the repeat unit wrapped in big
 * square brackets with a subscript ([repeat]ₙ) instead of a misleading
 * fixed-length chain. Ill-defined polymers (crosslinked / random copolymer /
 * branched) degrade to a line-notation card with no drawing.
 */
export function PolymerStructure({ id, name }: { id: string; name: string }) {
  const info = POLYMER_INFO[id];
  const [status, setStatus] = useState<StructureState>('loading');
  if (!info) return null;

  if (info.kind === 'text') {
    return (
      <div>
        <div className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface-hover px-6 text-center">
          <span className="break-all font-mono text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {info.notation}
          </span>
          <span className={POLYMER_BADGE}>聚合物 · 高分子</span>
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-dark">{info.note}</p>
      </div>
    );
  }

  // kind === 'repeat' — draw the repeat unit fragment and overlay [ ]ₙ.
  return (
    <div>
      <div className="relative flex h-56 w-full items-center justify-center rounded-xl border border-border bg-surface-hover px-10 sm:h-64">
        <Bracket side="left" />
        <div className="relative h-44 w-full max-w-[280px]">
          <StructureRender
            smiles={info.repeatUnitSmiles}
            ariaLabel={`${name} 重复单元结构`}
            width={260}
            height={170}
            fallbackPadding={6}
            transparent
            onState={setStatus}
          />
          {status === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted/30 border-t-primary" />
            </div>
          )}
        </div>
        <Bracket side="right" subscript={info.subscript ?? 'n'} />
      </div>
      <p className="mt-2 text-sm text-foreground">
        重复单元：<span className="font-mono">{info.notation}</span>
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className={POLYMER_BADGE}>聚合物 · 重复单元</span>
      </div>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-dark">{info.note}</p>
    </div>
  );
}

/**
 * Card thumbnail for polymers — a lightweight "[ ]ₙ" glyph (no chemistry engine)
 * so the grid stays zero-cost and never pulls a render library for polymers.
 */
export function PolymerThumb({ id }: { id: string }) {
  const info = POLYMER_INFO[id];
  if (!info) return null;
  return (
    <span
      aria-hidden
      className="inline-flex h-14 w-[76px] items-center justify-center font-mono text-xl font-semibold text-foreground/65"
    >
      [<span className="inline-block w-2" />]
      <sub className="text-sm">{info.subscript ?? 'n'}</sub>
    </span>
  );
}
