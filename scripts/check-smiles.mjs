// Data-quality guard for the ingredient SMILES in src/lib/mock-data.ts.
// Parses every SMILES with openchemlib and reports any that are invalid.
// Empty SMILES are allowed (mixtures / extracts / minerals with no single structure).
//
//   node scripts/check-smiles.mjs
//
// Exits non-zero if any non-empty SMILES fails to parse, so it can gate CI.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import OCL from 'openchemlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = readFileSync(join(root, 'src/lib/mock-data.ts'), 'utf8');

const re = /id: '([^']+)',[\s\S]{0,160}?smiles: '([^']*)'/g;
let m;
let total = 0;
let empty = 0;
const failures = [];

while ((m = re.exec(src))) {
  total++;
  const [, id, smiles] = m;
  if (!smiles.trim()) {
    empty++;
    continue;
  }
  try {
    OCL.Molecule.fromSmiles(smiles);
  } catch (e) {
    failures.push(`  ✗ ${id}: ${String(e.message).slice(0, 60)}  (${smiles})`);
  }
}

const valid = total - empty - failures.length;
console.log(`ingredients: ${total} | valid SMILES: ${valid} | empty (mixtures): ${empty} | invalid: ${failures.length}`);
if (failures.length) {
  console.error('\nInvalid SMILES:\n' + failures.join('\n'));
  process.exit(1);
}
console.log('✓ all SMILES parse');
