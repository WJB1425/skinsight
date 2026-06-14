// One-shot generator: compute each ingredient's molecular formula from its SMILES
// (openchemlib, dev-only) and write a `formula: '...'` line into src/lib/mock-data.ts
// right after each non-empty `smiles: '...'` line. Idempotent: skips entries that
// already have a formula line. Empty-SMILES mixtures get no formula.
//
//   node scripts/gen-formulas.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import OCL from 'openchemlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const FILE = join(root, 'src/lib/mock-data.ts');
let src = readFileSync(FILE, 'utf8');

let added = 0;
let skipped = 0;
// Match an ingredient's `    smiles: '...',` line plus whatever immediately follows,
// so we can avoid duplicating a formula line that's already there.
src = src.replace(
  /( {4}smiles: ')([^']*)(',\n)( {4}formula: '[^']*',\n)?/g,
  (m, p1, smi, p3, existingFormula) => {
    if (existingFormula) return m; // already has a formula line
    if (!smi.trim()) return m; // mixture/extract — no single formula
    let formula;
    try {
      formula = OCL.Molecule.fromSmiles(smi).getMolecularFormula().formula;
    } catch {
      skipped++;
      return m;
    }
    added++;
    return `${p1}${smi}${p3}    formula: '${formula}',\n`;
  },
);

writeFileSync(FILE, src);
console.log(`formulas added: ${added} | skipped (unparseable): ${skipped}`);
