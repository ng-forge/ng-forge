// Not vitest.config.*: Nx would infer a `test` target the root CI runs without this app's own install.
import { fileURLToPath } from 'node:url';
import { ngNative } from '@ng-native/testing/vitest';
import { defineConfig } from 'vitest/config';

const repo = (path: string) => fileURLToPath(new URL(`../../../${path}`, import.meta.url));
const core = (entry: string) => repo(`dist/packages/dynamic-forms/fesm2022/${entry}.mjs`);

// Component tests in Node against a fake of the native side: no emulator. ng-forge resolves the way
// metro.config.js resolves it, core from its build output and the adapter from source.
export default defineConfig({
  plugins: [ngNative({ inline: [/dist\/packages\/dynamic-forms\//, /ngxtension/] })],
  resolve: {
    alias: [
      { find: /^@ng-forge\/dynamic-forms\/(integration|internal|schema|testing)$/, replacement: core('ng-forge-dynamic-forms-$1') },
      { find: /^@ng-forge\/dynamic-forms$/, replacement: core('ng-forge-dynamic-forms') },
      { find: /^@ng-forge\/dynamic-forms-native$/, replacement: repo('packages/dynamic-forms-native/src/index.ts') },
    ],
    // ng-forge's files live outside this app; without this they would find the monorepo's own Angular.
    dedupe: ['@angular/core', '@angular/common', '@angular/forms', 'rxjs', 'ngxtension', '@ng-native/components'],
  },
  test: { include: ['src/**/*.test.ts'] },
});
