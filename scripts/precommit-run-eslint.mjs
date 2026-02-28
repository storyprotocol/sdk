#!/usr/bin/env node
/**
 * Pre-commit: run ESLint on staged packages/core-sdk files.
 * Replicates lint-staged behavior so the hook works without relying on
 * lint-staged binary in PATH (e.g. under pre-commit framework).
 */
import { execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CORE_SDK_PREFIX = 'packages/core-sdk/';
const EXT_RE = /\.(ts|tsx|js|jsx|mjs|cjs)$/i;

const out = execSync('git diff --cached --name-only', { encoding: 'utf-8', cwd: root });
const staged = out
  .split('\n')
  .map((s) => s.trim())
  .filter((s) => s.startsWith(CORE_SDK_PREFIX) && EXT_RE.test(s));

if (staged.length === 0) {
  process.exit(0);
}

const result = spawnSync(
  process.execPath,
  [join(root, 'scripts/precommit-eslint-core-sdk.mjs'), ...staged],
  { stdio: 'inherit', cwd: root },
);
process.exit(result.status ?? 1);
