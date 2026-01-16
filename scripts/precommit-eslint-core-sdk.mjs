import { spawnSync } from 'node:child_process';

const CORE_SDK_PREFIX = 'packages/core-sdk/';

const inputFiles = process.argv.slice(2);
const coreSdkFiles = inputFiles
  .filter((f) => typeof f === 'string' && f.startsWith(CORE_SDK_PREFIX))
  .map((f) => f.slice(CORE_SDK_PREFIX.length));

// If nothing matched, do nothing (pre-commit may still call the hook).
if (coreSdkFiles.length === 0) {
  process.exit(0);
}

const result = spawnSync(
  'pnpm',
  ['-C', 'packages/core-sdk', 'lint', '--', ...coreSdkFiles],
  { stdio: 'inherit' },
);

process.exit(result.status ?? 1);
