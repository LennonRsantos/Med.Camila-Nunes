// Copies the deployable site into dist/ (Vercel's output directory, see vercel.json).
// Runs after Sass has compiled styles.css; only these files are published.
import { cpSync, mkdirSync, rmSync } from 'node:fs';

const out = 'dist';
const files = ['index.html', 'styles.css', 'script.js', 'assets'];

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
files.forEach((file) => cpSync(file, `${out}/${file}`, { recursive: true }));

console.log(`Site copied to ${out}/: ${files.join(', ')}`);
