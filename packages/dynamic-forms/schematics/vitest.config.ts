import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(here, '../../..');

export default defineConfig({
  root: here,
  cacheDir: resolve(workspaceRoot, 'node_modules/.vite/dynamic-forms-schematics'),
  test: {
    environment: 'node',
    pool: 'forks',
    include: ['**/*.spec.ts'],
    globals: false,
    reporters: ['default'],
  },
});
