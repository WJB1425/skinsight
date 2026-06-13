'use client';

import { useEffect, useRef, useState } from 'react';
import { Atom, AlertTriangle } from 'lucide-react';

// Atom colors tuned for the dark (#1a1a1a) surface so heteroatoms read clearly.
const MOLECULE_THEME = {
  FOREGROUND: '#e5e7eb',
  BACKGROUND: '#1a1a1a',
  C: '#e5e7eb', // carbon — light gray (skeletal lines)
  N: '#60a5fa', // blue-400
  O: '#f87171', // red-400
  S: '#fbbf24', // amber-400
  P: '#fb923c', // orange-400
  SI: '#a78bfa', // violet-400 — silicones are everywhere in cosmetics
  F: '#34d399', // emerald-400
  CL: '#2dd4bf', // teal-400
  BR: '#fb923c',
  I: '#c084fc', // purple-400
  B: '#fbbf24',
  H: '#9ca3af', // gray-400
};

interface MoleculeViewerProps {
  smiles?: string;
  /** Chinese name, used for the accessible label. */
  name: string;
}

type Status = 'loading' | 'done' | 'error' | 'empty';

/**
 * Renders a 2D molecular structure from a SMILES string entirely in the browser
 * (via smiles-drawer). Gracefully degrades when the SMILES is missing
 * (mixtures/extracts) or cannot be parsed.
 */
export function MoleculeViewer({ smiles, name }: MoleculeViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const trimmed = (smiles ?? '').trim();
    if (!trimmed) {
      setStatus('empty');
      return;
    }

    let cancelled = false;
    setStatus('loading');

    (async () => {
      try {
        const SmilesDrawer = (await import('smiles-drawer')).default;
        const svg = svgRef.current;
        if (cancelled || !svg) return;

        const drawer = new SmilesDrawer.SmiDrawer({
          padding: 24,
          themes: { skininsight: MOLECULE_THEME },
        });

        drawer.draw(
          trimmed,
          svg,
          'skininsight',
          () => {
            if (!cancelled) setStatus('done');
          },
          () => {
            if (!cancelled) setStatus('error');
          },
        );
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [smiles]);

  return (
    <div className="relative w-full h-56 sm:h-64 bg-surface-hover rounded-lg border border-border overflow-hidden flex items-center justify-center">
      {/* Kept mounted so the ref exists at draw time; faded in once drawn. */}
      <svg
        ref={svgRef}
        role="img"
        aria-label={`${name} 化学结构图`}
        className={`w-full h-full transition-opacity duration-500 ${
          status === 'done' ? 'opacity-100' : 'opacity-0'
        }`}
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
          <AlertTriangle className="w-6 h-6 text-amber-400/60" />
          <span className="text-xs text-muted leading-relaxed">结构图暂时无法生成</span>
        </div>
      )}
    </div>
  );
}
