// Not vite.config.*: Nx would infer targets the root CI runs without this app's own install.
import { fileURLToPath } from 'node:url';
import { ngNativeWeb } from '@ng-native/web/vite';
import { linkAngularPackage } from '@oxc-angular/vite/api';
import { defineConfig, type Plugin } from 'vite';

const repo = (path: string) => fileURLToPath(new URL(`../../../${path}`, import.meta.url));
const core = (entry: string) => repo(`dist/packages/dynamic-forms/fesm2022/${entry}.mjs`);

/** The linker in ngNativeWeb() only looks under node_modules, and core's build output is not there. */
const linkCore = (): Plugin => ({
  name: 'ng-forge:link-core',
  async transform(code, id) {
    if (!id.includes('/dist/packages/dynamic-forms/') || !code.includes('ɵɵngDeclare')) return null;
    const result = await linkAngularPackage(code, id);
    return result.linked ? { code: result.code, map: result.map ?? null } : null;
  },
});

// The same scenarios in a browser, through @ng-native/web. ng-forge resolves as in metro.config.js.
export default defineConfig({
  plugins: [ngNativeWeb(), linkCore()],
  resolve: {
    alias: [
      { find: /^@ng-forge\/dynamic-forms\/(integration|internal|schema|testing)$/, replacement: core('ng-forge-dynamic-forms-$1') },
      { find: /^@ng-forge\/dynamic-forms$/, replacement: core('ng-forge-dynamic-forms') },
      { find: /^@ng-forge\/dynamic-forms-native$/, replacement: repo('packages/dynamic-forms-native/src/index.ts') },
    ],
    dedupe: ['@angular/core', '@angular/common', '@angular/forms', 'rxjs', 'ngxtension', '@ng-native/components'],
  },
  server: { port: 4220, strictPort: true },
  preview: { port: 4220, strictPort: true },
});
