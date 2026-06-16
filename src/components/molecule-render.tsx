'use client';

import { useEffect, useRef, useState } from 'react';
import { loadRDKit, renderMoleculeSvg } from '@/lib/rdkit';
import { cn } from '@/lib/utils';

// Atom colors tuned for the light (#f5f5f7) surface so heteroatoms read clearly.
// Used by the smiles-drawer fallback here and by MoleculeThumb in molecule-viewer.
export const MOLECULE_THEME = {
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

// Same atom palette, transparent canvas so the structure sits on the surface.
export const THUMB_THEME = { ...MOLECULE_THEME, BACKGROUND: 'transparent' };

export type StructureState = 'loading' | 'done' | 'error' | 'empty';

interface StructureRenderProps {
  smiles?: string;
  ariaLabel?: string;
  /** Intrinsic RDKit canvas size; defines aspect ratio (viewBox scales to fit). */
  width?: number;
  height?: number;
  /** smiles-drawer padding when the fallback path runs. */
  fallbackPadding?: number;
  /** Use the transparent smiles-drawer theme on fallback (thumbnails/fragments). */
  transparent?: boolean;
  /** Lifecycle callback so callers can render their own chrome. */
  onState?: (s: StructureState) => void;
}

/**
 * Shared 2D structure renderer: tries RDKit (publication-grade SVG) first and
 * falls back to smiles-drawer on any failure. Reports lifecycle via `onState`
 * so callers own their loading/empty/error chrome. RDKit's heap is freed inside
 * renderMoleculeSvg. The injected SVG carries a viewBox, so width:100% + the
 * SVG default preserveAspectRatio="xMidYMid meet" scales it without distortion.
 */
export function StructureRender({
  smiles,
  ariaLabel,
  width = 480,
  height = 250,
  fallbackPadding = 24,
  transparent = false,
  onState,
}: StructureRenderProps) {
  const divRef = useRef<HTMLDivElement>(null); // RDKit SVG-string target
  const svgRef = useRef<SVGSVGElement>(null); // smiles-drawer target
  const onStateRef = useRef(onState);
  onStateRef.current = onState;
  const [renderer, setRenderer] = useState<'none' | 'rdkit' | 'smiles'>('none');

  useEffect(() => {
    const emit = (s: StructureState) => onStateRef.current?.(s);
    const trimmed = (smiles ?? '').trim();
    if (!trimmed) {
      setRenderer('none');
      emit('empty');
      return;
    }

    let cancelled = false;
    setRenderer('none');
    emit('loading');

    const drawWithSmilesDrawer = async () => {
      try {
        const SmilesDrawer = (await import('smiles-drawer')).default;
        const svgEl = svgRef.current;
        if (cancelled || !svgEl) return;
        const drawer = new SmilesDrawer.SmiDrawer({
          padding: fallbackPadding,
          themes: { skininsight: transparent ? THUMB_THEME : MOLECULE_THEME },
        });
        drawer.draw(
          trimmed,
          svgEl,
          'skininsight',
          () => {
            if (!cancelled) {
              setRenderer('smiles');
              emit('done');
            }
          },
          () => {
            if (!cancelled) emit('error');
          },
        );
      } catch {
        if (!cancelled) emit('error');
      }
    };

    (async () => {
      // 1) RDKit first. The loader's ~7MB WASM compile is one-time and cached,
      //    so we don't race it against a timeout (that would spuriously fall
      //    back on a slow first load); failures resolve to null quickly.
      let svg: string | null = null;
      try {
        const rdkit = await loadRDKit();
        if (cancelled) return;
        if (rdkit) svg = renderMoleculeSvg(rdkit, trimmed, { width, height });
      } catch {
        svg = null;
      }
      if (cancelled) return;
      const box = divRef.current;
      if (svg && box) {
        box.innerHTML = svg;
        setRenderer('rdkit');
        emit('done');
        return;
      }
      // 2) Fallback: smiles-drawer into the <svg> ref (the original behaviour).
      await drawWithSmilesDrawer();
    })();

    return () => {
      cancelled = true;
    };
  }, [smiles, width, height, fallbackPadding, transparent]);

  return (
    <>
      <div
        ref={divRef}
        role="img"
        aria-label={ariaLabel}
        className={cn(
          'h-full w-full transition-opacity duration-300 [&>svg]:h-full [&>svg]:w-full',
          renderer === 'rdkit' ? 'block opacity-100' : 'hidden opacity-0',
        )}
      />
      <svg
        ref={svgRef}
        aria-hidden
        className={cn(
          'h-full w-full transition-opacity duration-300',
          renderer === 'smiles' ? 'block opacity-100' : 'hidden opacity-0',
        )}
      />
    </>
  );
}
