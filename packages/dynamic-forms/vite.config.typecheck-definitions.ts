import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

// Isolated program for the internal/ and integration/ field-definition type-tests.
// These assert base-registry facts (e.g. `AvailableFieldTypes` is exactly the core
// container/leaf set), so they must typecheck against a CLEAN registry: the general
// program augments value-field leaves for the DynamicForm test, and the inference
// program registers a broad leaf set — either would falsify the whitelists here.
//
// Run as a `dependsOn` of the `type-test` target (see project.json), so it shares
// the same CI enforcement with nothing extra to wire.
const DEFINITIONS = ['internal/src/**/*.type-test.ts', 'integration/src/**/*.type-test.ts'];

export default defineConfig({
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    include: DEFINITIONS,
    reporters: ['verbose'],
    passWithNoTests: false,
    typecheck: {
      enabled: true,
      only: true,
      include: DEFINITIONS,
      tsconfig: './tsconfig.typecheck-definitions.json',
    },
  },
});
