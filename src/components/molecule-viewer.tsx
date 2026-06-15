'use client';

import { useEffect, useRef, useState } from 'react';
import { Atom, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Atom colors tuned for the light (#f5f5f7) surface so heteroatoms read clearly.
const MOLECULE_THEME = {
  FOREGROUND: '#1d1d1f',
  BACKGROUND: '#f5f5f7',
  C: '#1d1d1f', // carbon — near-black (skeletal lines)
  N: '#2563eb', // blue-600
  O: '#dc2626', // red-600
  S: '#d97706', // amber-600
  P: '#ea580c', // orange-600
  SI: '#7c3aed', // violet-600 — silicones are everywhere in cosmetics
  F: '#059669', // emerald-600
  CL: '#0d9488', // teal-600
  BR: '#ea580c',
  I: '#9333ea', // purple-600
  B: '#d97706',
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
    <div className="relative w-full h-56 sm:h-64 bg-surface-hover rounded-xl border border-border overflow-hidden flex items-center justify-center">
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
          <AlertTriangle className="w-6 h-6 text-amber-500/70" />
          <span className="text-xs text-muted leading-relaxed">结构图暂时无法生成</span>
        </div>
      )}
    </div>
  );
}

/**
 * Compact 2D structure thumbnail for list cards. Same browser-side render as
 * MoleculeViewer but in a small fixed box; renders nothing when there is no
 * parsable SMILES (mixtures/extracts) so cards stay clean.
 */
export function MoleculeThumb({
  smiles,
  className,
}: {
  smiles?: string;
  className?: string;
}) {
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
          padding: 6,
          themes: { skininsight: MOLECULE_THEME },
        });

        drawer.draw(
          trimmed,
          svg,
          'skininsight',
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
    <span
      className={cn(
        'block h-14 w-[76px] overflow-hidden rounded-lg border border-border bg-surface-hover',
        className,
      )}
    >
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
