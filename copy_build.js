import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const publicMode = process.argv.includes('--public') || process.env.ROANOKE_PUBLIC_HARDENING === 'true';

function copyDir(src, dest) {
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (publicMode && ['src', 'node_modules', '.git'].includes(entry.name)) continue;
      copyDir(srcPath, destPath);
    } else {
      if (publicMode && /\.(map|ts|tsx|jsx|env|key|pem)$/i.test(entry.name)) continue;
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

copyDir('dist', 'deploy_me');

if (publicMode) {
  const files = walk('deploy_me')
    .map(file => ({ path: path.relative('deploy_me', file).replaceAll(path.sep, '/'), sha256: sha256(file), bytes: fs.statSync(file).size }))
    .sort((a, b) => a.path.localeCompare(b.path));
  const manifest = {
    schema: 'roanoke.publicDeploySeal.v1',
    hardening: true,
    sourceReadable: true,
    deployContainsSource: false,
    sourcemaps: false,
    consoleDebuggerStripped: true,
    privateKeysEmbedded: false,
    generatedAt: new Date().toISOString(),
    fileCount: files.length,
    files,
  };
  fs.writeFileSync('deploy_me/ROANOKE_PUBLIC_SEAL.json', JSON.stringify(manifest, null, 2));
}

console.log(`Build copied to deploy_me successfully${publicMode ? ' with ROANOKE public hardening seal.' : '.'}`);
