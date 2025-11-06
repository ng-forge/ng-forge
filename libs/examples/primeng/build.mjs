import * as esbuild from 'esbuild';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const distPath = 'dist/libs/examples/primeng';

// Build the bundled web components library
await esbuild.build({
  entryPoints: ['libs/examples/primeng/src/index.ts'],
  bundle: true,
  outfile: `${distPath}/index.mjs`,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  external: [], // Bundle everything
  sourcemap: true,
  minify: false,
  define: {
    'ngDevMode': 'false',
    'ngJitMode': 'false',
  },
  banner: {
    js: '// @ng-forge/examples-primeng - Bundled PrimeNG examples as web components\n',
  },
});

// Create minimal type definitions
const typeDefinitions = `/**
 * Register a single PrimeNG example as a web component
 * @param name - The name of the web component to register
 */
export declare function registerPrimeExample(name: string): Promise<void>;

/**
 * Register all PrimeNG examples as web components
 */
export declare function registerPrimeNGExamples(): Promise<void>;
`;

await writeFile(join(distPath, 'index.d.ts'), typeDefinitions);

// Create package.json
const packageJson = {
  name: '@ng-forge/examples-primeng',
  version: '0.0.1',
  type: 'module',
  main: 'index.mjs',
  types: 'index.d.ts',
  sideEffects: false,
};

await writeFile(join(distPath, 'package.json'), JSON.stringify(packageJson, null, 2));

console.log('✅ Built @ng-forge/examples-primeng bundle');
