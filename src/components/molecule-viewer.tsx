'use client';

import { useEffect, useRef, useState } from 'react';
import { Atom, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StructureRender, THUMB_THEME, type StructureState } from '@/components/molecule-render';

interface MoleculeViewerProps {
  smiles?: string;
  /** Chinese name, used for the accessible label. */
  name: string;
}

/**
 * Renders a 2D molecular structure for the detail view. Tries RDKit.js for a
 * publication-grade SVG and falls back to smiles-drawer (both via
 * StructureRender). Gracefully degrades when the SMILES is missing
 * (mixtures/extracts) or cannot be parsed by either engine.
 */
export function MoleculeViewer({ smiles, name }: MoleculeViewerProps) {
  const [status, setStatus] = useState<StructureState>('loading');

  return (
    <div className="relative w-full h-56 sm:h-64 bg-surface-hover rounded-xl border border-border overflow-hidden flex items-center justify-center">
      <StructureRender
        smiles={smiles}
        ariaLabel={`${name} 化学结构图`}
        width={480}
        height={250}
        fallbackPadding={24}
        onState={setStatus}
      />

      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-muted/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm text-muted">生成结构图中…</span>
        </div>
      )}

      {status === 'empty' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6">
          <Atom className="w-6 h-6 text-muted/40" />
          <span className="text-xs text-muted leading-relaxed">
            该成分为混合物/提取物，无单一分子结构图
          </span>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-6">
          <AlertTriangle className="w-6 h-6 text-amber-500/70" />
          <span className="text-xs text-muted leading-relaxed">结构图暂时无法生成</span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact 2D structure thumbnail for list cards — drawn directly on the card
 * surface (no background block, matching the design). Stays on smiles-drawer
 * (lightweight) so scrolling the ~90-card grid never pulls RDKit's ~7MB WASM;
 * the detail view is where RDKit's crisper rendering matters. Renders nothing
 * when there is no parsable SMILES (mixtures/extracts) so cards stay clean.
 */
export function MoleculeThumb({ smiles, className }: { smiles?: string; className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [done, setDone] = useState(false);
  const trimmed = (smiles ?? '').trim();

  useEffect(() => {
    if (!trimmed) return;
    let cancelled = false;

    (async () => {
      try {
        const SmilesDrawer = (await import('smiles-drawer')).default;
        const svg = svgRef.current;
        if (cancelled || !svg) return;

        const drawer = new SmilesDrawer.SmiDrawer({
          padding: 4,
          themes: { thumb: THUMB_THEME },
        });

        drawer.draw(
          trimmed,
          svg,
          'thumb',
          () => {
            if (!cancelled) setDone(true);
          },
          () => {},
        );
      } catch {
        /* unparseable — leave blank */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [trimmed]);

  if (!trimmed) return null;

  return (
    <span className={cn('block h-14 w-[76px] overflow-hidden', className)}>
      <svg
        ref={svgRef}
        aria-hidden
        className={cn(
          'h-full w-full transition-opacity duration-500',
          done ? 'opacity-100' : 'opacity-0',
        )}
      />
    </span>
  );
}
