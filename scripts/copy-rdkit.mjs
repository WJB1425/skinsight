// Copies RDKit MinimalLib (Emscripten glue + wasm) from the installed package
// into public/rdkit/ so it can be served as a static asset and loaded via a
// runtime <script> tag (see src/lib/rdkit.ts). public/rdkit/ is gitignored;
// this runs automatically on `predev` / `prebuild` (and on Vercel during build).
//
//   node scripts/copy-rdkit.mjs
import { mkdirSync, copyFileSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = join(root, 'node_modules/@rdkit/rdkit/dist');
const outDir = join(root, 'public/rdkit');
const files = ['RDKit_minimal.js', 'RDKit_minimal.wasm'];

mkdirSync(outDir, { recursive: true });

let copied = 0;
for (const f of files) {
  const src = join(srcDir, f);
  const dst = join(outDir, f);
  if (!existsSync(src)) {
    console.error(`✗ missing ${src} — is @rdkit/rdkit installed?`);
    process.exit(1);
  }
  // Skip if the destination already matches (same byte size).
  if (existsSync(dst) && statSync(dst).size === statSync(src).size) continue;
  copyFileSync(src, dst);
  copied++;
}

console.log(`✓ rdkit assets in public/rdkit (${copied} copied, ${files.length - copied} up-to-date)`);
