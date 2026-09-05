import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    include: ['src/**/*.type-test.ts'],
    reporters: ['tree'],
    passWithNoTests: false,
    typecheck: {
      enabled: true,
      only: true,
      include: ['src/**/*.type-test.ts'],
      tsconfig: './tsconfig.typecheck.json',
    },
  },
});
