import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    include: ['src/lib/fields/**/*.type-test.ts'],
    reporters: ['verbose'],
    passWithNoTests: false,
    typecheck: {
      enabled: true,
      only: true,
      include: ['src/lib/fields/**/*.type-test.ts'],
      tsconfig: './tsconfig.spec.json',
    },
  },
});
