import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    include: [
      'src/lib/definitions/base/**/*.type-test.ts',
      'src/lib/models/logic/**/*.type-test.ts',
      'src/lib/models/validation/**/*.type-test.ts',
      'src/lib/models/schemas/**/*.type-test.ts',
      'src/lib/models/**/*.type-test.ts',
    ],
    reporters: ['verbose'],
    passWithNoTests: false,
    typecheck: {
      enabled: true,
      only: true,
      include: [
        'src/lib/definitions/base/**/*.type-test.ts',
        'src/lib/models/logic/**/*.type-test.ts',
        'src/lib/models/validation/**/*.type-test.ts',
        'src/lib/models/schemas/**/*.type-test.ts',
        'src/lib/models/**/*.type-test.ts',
      ],
      tsconfig: './tsconfig.typecheck.json',
    },
  },
});
