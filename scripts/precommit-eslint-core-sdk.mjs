import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const CORE_SDK_PREFIX = 'packages/core-sdk/';

const inputFiles = process.argv.slice(2);
const coreSdkFiles = inputFiles
  .filter((f) => typeof f === 'string' && f.startsWith(CORE_SDK_PREFIX))
  .map((f) => f.slice(CORE_SDK_PREFIX.length));

// If nothing matched, do nothing (pre-commit may still call the hook).
if (coreSdkFiles.length === 0) {
  process.exit(0);
}

const root = process.cwd();
const coreSdkDir = join(root, 'packages/core-sdk');
// pnpm store may put bins in core-sdk/node_modules/.bin or root node_modules/.bin
const coreSdkBin = join(coreSdkDir, 'node_modules/.bin');
const rootBin = join(root, 'node_modules/.bin');
const sep = process.platform === 'win32' ? ';' : ':';
const env = {
  ...process.env,
  PATH: [coreSdkBin, rootBin, process.env.PATH].filter(Boolean).join(sep),
};

const result = spawnSync(
  'pnpm',
  ['run', 'lint', '--', ...coreSdkFiles],
  { cwd: coreSdkDir, stdio: 'inherit', env },
);

process.exit(result.status ?? 1);
