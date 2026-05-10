import fs from 'fs';
import path from 'path';

const root = process.argv[2] || 'dist';
const forbiddenExts = new Set(['.map', '.ts', '.tsx', '.jsx', '.env', '.pem', '.key']);
const forbiddenNames = [/\.env/i, /package-lock\.json$/i, /package\.json$/i, /tsconfig/i, /vite\.config/i, /^src$/i, /^node_modules$/i];
const forbiddenText = [
  { name: 'sourceMappingURL', re: /sourceMappingURL/ },
  { name: 'GEMINI_API_KEY', re: /GEMINI_API_KEY/ },
  { name: 'debugger statement', re: /\bdebugger\b/ },
  { name: 'console call', re: /\bconsole\s*\./ },
  { name: 'raw TypeScript source path', re: /src\/(screens|components|roanoke|audio)\// },
];

function walk(dir) {
  if (!fs.existsSync(dir)) throw new Error(`Missing build directory: ${dir}`);
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const files = walk(root);
const problems = [];

for (const file of files) {
  const rel = path.relative(root, file).replaceAll(path.sep, '/');
  const ext = path.extname(file);
  if (forbiddenExts.has(ext)) problems.push(`${rel}: forbidden extension ${ext}`);
  if (rel.split('/').some(part => forbiddenNames.some(re => re.test(part)))) problems.push(`${rel}: forbidden deploy filename/path`);

  const stat = fs.statSync(file);
  if (stat.size > 2_500_000) problems.push(`${rel}: unusually large asset (${stat.size} bytes)`);

  if (/\.(js|css|html|json|txt|svg)$/i.test(file)) {
    const text = fs.readFileSync(file, 'utf8');
    for (const rule of forbiddenText) {
      if (rule.re.test(text)) problems.push(`${rel}: contains ${rule.name}`);
    }
  }
}

if (problems.length) {
  console.error('ROANOKE PUBLIC HARDENING AUDIT: FAIL');
  for (const problem of problems) console.error(` - ${problem}`);
  process.exit(1);
}

console.log(`ROANOKE PUBLIC HARDENING AUDIT: PASS (${files.length} files checked in ${root})`);
