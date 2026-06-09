import { defineConfig } from 'vitest/config';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

// General type-tests. Excludes the inference type-tests: those register a broad
// value-field registry that inflates `InferFormValue<RegisteredFieldTypes[]>`, and
// this program pulls in DI/component source (`dynamic-form-di.ts`) that evaluates
// it — a broad registry here would overflow TS's union complexity limit. The
// inference suite runs in its own isolated program via `vite.config.typecheck-inference.ts`
// (wired as a `dependsOn` of this target, so it can't fall out of CI enforcement).
const INFERENCE = ['src/lib/form-value-inference.type-test.ts', 'src/lib/form-value-inference.test-registry.type-test.ts'];

export default defineConfig({
  plugins: [nxViteTsPaths()],
  test: {
    globals: true,
    include: ['src/**/*.type-test.ts'],
    exclude: INFERENCE,
    reporters: ['verbose'],
    passWithNoTests: false,
    typecheck: {
      enabled: true,
      only: true,
      include: ['src/**/*.type-test.ts'],
      exclude: INFERENCE,
      tsconfig: './tsconfig.typecheck.json',
    },
  },
});
