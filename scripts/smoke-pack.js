/* Packs both publishable packages and verifies the tarballs contain what consumers (angular-sdk) rely on. */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const targets = [
  { dir: 'dist/angular-sdk-components', expect: ['package/package.json', 'package/fesm2022/', 'package/types/'] },
  { dir: 'packages/angular-sdk-overrides', expect: ['package/package.json', 'package/lib/'] }
];

const out = fs.mkdtempSync(path.join(os.tmpdir(), 'sdk-smoke-'));
let failed = false;

for (const { dir, expect } of targets) {
  const cwd = path.join(root, dir);
  if (!fs.existsSync(cwd)) {
    console.error(`Missing ${dir}; run the build first.`);
    process.exit(1);
  }
  const tgz = execFileSync('npm', ['pack', '--pack-destination', out, '--silent'], { cwd, encoding: 'utf8' }).trim().split('\n').pop();
  const files = execFileSync('tar', ['-tzf', path.join(out, tgz)], { encoding: 'utf8' }).split('\n');
  for (const e of expect) {
    if (!files.some(f => f.startsWith(e))) {
      console.error(`${tgz}: missing ${e}`);
      failed = true;
    }
  }
  console.log(`${tgz}: ${files.length} entries checked`);
}

fs.rmSync(out, { recursive: true, force: true });
process.exit(failed ? 1 : 0);
