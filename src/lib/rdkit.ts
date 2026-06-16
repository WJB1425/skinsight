// RDKit.js (MinimalLib WASM) singleton loader + SVG render helper.
//
// We deliberately do NOT `import('@rdkit/rdkit')` and let webpack bundle the
// Emscripten glue — it trips over Node `require`/`import.meta` and locating the
// .wasm relative to the current App-Router route. Instead the glue + .wasm are
// copied into public/rdkit/ by scripts/copy-rdkit.mjs, the glue is injected as
// a <script> at runtime (which sets window.initRDKitModule), and we init with
// an absolute `locateFile` so the path is route-independent. RDKit initialises
// once and is shared by every structure render (molecule detail view + polymer
// repeat-unit fragment). The package's own d.ts already augments
// `Window.initRDKitModule`, so no extra ambient declaration is needed.
import type { JSMol, RDKitModule } from '@rdkit/rdkit';

const RDKIT_SCRIPT_SRC = '/rdkit/RDKit_minimal.js';
const RDKIT_WASM_SRC = '/rdkit/RDKit_minimal.wasm';

let rdkitPromise: Promise<RDKitModule | null> | null = null;

/** Inject the RDKit glue script once and resolve when it has loaded. */
function injectScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-rdkit="1"]');
    if (existing) {
      if (existing.dataset.loaded === '1') resolve();
      else {
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', () => reject(new Error('rdkit script failed to load')));
      }
      return;
    }
    const el = document.createElement('script');
    el.src = src;
    el.async = true;
    el.dataset.rdkit = '1';
    el.addEventListener('load', () => {
      el.dataset.loaded = '1';
      resolve();
    });
    el.addEventListener('error', () => reject(new Error('rdkit script failed to load')));
    document.head.appendChild(el);
  });
}

/**
 * Lazily load + initialise RDKit MinimalLib in the browser, cached so the ~7MB
 * WASM compiles only once. Returns null on the server, or if loading/init fails
 * (callers fall back to smiles-drawer).
 */
export function loadRDKit(): Promise<RDKitModule | null> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!rdkitPromise) {
    rdkitPromise = injectScript(RDKIT_SCRIPT_SRC)
      .then(() => window.initRDKitModule({ locateFile: () => RDKIT_WASM_SRC }))
      .then((rdkit) => {
        // CoordGen yields cleaner, more ChemDraw-like 2D layouts.
        try {
          rdkit.prefer_coordgen(true);
        } catch {
          /* older builds may lack it — ignore */
        }
        return rdkit;
      })
      .catch(() => null);
  }
  return rdkitPromise;
}

// ---- drawing options ------------------------------------------------------

// Heteroatom palette mirrored from molecule-render's MOLECULE_THEME (hex), in
// RDKit's float-RGB form keyed by atomic number, so the RDKit render and the
// smiles-drawer fallback read the same colour-wise on the light surface.
const ATOM_PALETTE: Record<number, [number, number, number]> = {
  6: [0.114, 0.114, 0.122], //  C  #1d1d1f
  7: [0.145, 0.388, 0.922], //  N  #2563eb
  8: [0.863, 0.149, 0.149], //  O  #dc2626
  16: [0.851, 0.467, 0.024], // S  #d97706
  15: [0.918, 0.345, 0.047], // P  #ea580c
  14: [0.486, 0.227, 0.929], // Si #7c3aed
  9: [0.02, 0.588, 0.412], //   F  #059669
  17: [0.051, 0.58, 0.533], //  Cl #0d9488
  35: [0.918, 0.345, 0.047], // Br #ea580c
  53: [0.576, 0.2, 0.918], //   I  #9333ea
  5: [0.851, 0.467, 0.024], //  B  #d97706
  1: [0.612, 0.639, 0.686], //  H  #9ca3af
};

export interface DrawOpts {
  width: number;
  height: number;
}

function drawOptionsJson({ width, height }: DrawOpts): string {
  return JSON.stringify({
    width,
    height,
    // Transparent — the surrounding container provides the background colour.
    backgroundColour: [1, 1, 1, 0],
    atomColourPalette: ATOM_PALETTE,
    bondLineWidth: 1.1,
    padding: 0.07,
  });
}

/**
 * Render a SMILES to a publication-grade SVG string via RDKit. Returns null on
 * any failure (invalid SMILES, RDKit unavailable) so callers can fall back.
 * Frees the molecule's WASM heap in `finally` — mandatory to avoid leaks.
 */
export function renderMoleculeSvg(rdkit: RDKitModule, smiles: string, opts: DrawOpts): string | null {
  let mol: JSMol | null = null;
  try {
    mol = rdkit.get_mol(smiles);
    if (!mol || !mol.is_valid()) return null;
    return mol.get_svg_with_highlights(drawOptionsJson(opts));
  } catch {
    return null;
  } finally {
    mol?.delete();
  }
}
