import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

// Isolated program for the `InferFormValue` / `InferFormModel` type-tests. These
// register a broad value-field registry (so every leaf/container inference path can
// be exercised), which inflates `InferFormValue<RegisteredFieldTypes[]>`. Keeping
// them out of the general program means no DI/component source is pulled in to
// evaluate that type, so TS's union complexity limit is not hit.
//
// Run as a `dependsOn` of the `type-test` target (see project.json), so it shares
// the same CI enforcement with nothing extra to wire.
const INFERENCE = ['src/lib/form-value-inference.type-test.ts', 'src/lib/form-value-inference.test-registry.type-test.ts'];

export default defineConfig({
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    include: INFERENCE,
    reporters: ['verbose'],
    passWithNoTests: false,
    typecheck: {
      enabled: true,
      only: true,
      include: INFERENCE,
      tsconfig: './tsconfig.typecheck-inference.json',
    },
  },
});
