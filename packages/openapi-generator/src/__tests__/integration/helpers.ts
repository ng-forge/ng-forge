import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { readFileSync, writeFileSync } from 'node:fs';
import { basename } from 'node:path';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const fixtureDir = resolve(__dirname, '__fixtures__');

export function fixturePath(name: string): string {
  return join(fixtureDir, name);
}

export async function createTempDir(): Promise<string> {
  return mkdtemp(join(tmpdir(), 'openapi-gen-integration-'));
}

export async function cleanupDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
}

export async function readGenerated(outputDir: string, subdirectory: string, fileName: string): Promise<string> {
  return readFile(join(outputDir, subdirectory, fileName), 'utf-8');
}

export async function readConfigFile(dir: string): Promise<Record<string, unknown>> {
  const content = await readFile(join(dir, '.ng-forge-generator.json'), 'utf-8');
  return JSON.parse(content);
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
}

// Shared adapter typing path — used by both the programmatic typecheck and the tsconfig writer
// so they can't drift. ng-packagr places typings under types/<pkg-name>.d.ts.
function resolveAdapterTypings(adapter: AdapterName): { pkg: string; typingsPath: string; dist: string } {
  const repoRoot = resolve(__dirname, '../../../../..');
  const dist = resolve(repoRoot, `dist/packages/dynamic-forms-${adapter}`);
  return {
    pkg: `@ng-forge/dynamic-forms-${adapter}`,
    typingsPath: resolve(dist, `types/ng-forge-dynamic-forms-${adapter}.d.ts`),
    dist,
  };
}

function resolveCompilerPaths(adapter: AdapterName): Record<string, string[]> {
  const repoRoot = resolve(__dirname, '../../../../..');
  const dynamicFormsDist = resolve(repoRoot, 'dist/packages/dynamic-forms');
  const { pkg, typingsPath } = resolveAdapterTypings(adapter);
  return {
    '@ng-forge/dynamic-forms': [dynamicFormsDist],
    '@ng-forge/dynamic-forms/integration': [join(dynamicFormsDist, 'integration')],
    [pkg]: [typingsPath.replace(/\.d\.ts$/, '')],
  };
}

/**
 * Extract the exported `...FormConfig` identifier from a generator-produced form file.
 * The generator always emits exactly one `export const <name>FormConfig = {...}`.
 */
function extractFormConfigExport(formSource: string): string | null {
  const match = formSource.match(/export\s+const\s+(\w+FormConfig)\s*=/);
  return match ? match[1] : null;
}

export type AdapterName = 'material' | 'bootstrap' | 'primeng' | 'ionic';

/**
 * Type-check a generator-produced form file the way a real consumer would: with a UI
 * adapter (Material by default) registered via module augmentation. The adapter import
 * is what activates field types like `'input'` — without it the generated config fails
 * against the core-only `RegisteredFieldTypes`.
 *
 * Resolves `@ng-forge/dynamic-forms` and the adapter via tsconfig `paths` so the test
 * is self-contained. Requires `dist/packages/dynamic-forms` and
 * `dist/packages/dynamic-forms-{adapter}` to exist — `nx build dynamic-forms` and the
 * adapter build must run before.
 *
 * Returns an array of pretty-formatted diagnostics. Empty array === clean compile.
 */
export function typecheckGeneratedForm(formFilePath: string, adapter: AdapterName = 'material'): string[] {
  const repoRoot = resolve(__dirname, '../../../../..');
  const { pkg } = resolveAdapterTypings(adapter);

  // Derive the form-file identifier so this works for any fixture, not just create-user.
  const formSource = readFileSync(formFilePath, 'utf-8');
  const exportName = extractFormConfigExport(formSource);
  if (!exportName) {
    return [`Could not locate an \`export const …FormConfig\` in ${formFilePath}`];
  }
  const formModuleBasename = basename(formFilePath).replace(/\.ts$/, '');

  // Companion file activates the adapter registry via side-effect import. Mirrors the
  // consumer-side `import '@ng-forge/dynamic-forms-material'` (or equivalent tsconfig
  // `types` entry) that issue #341 surfaced.
  const consumerFilePath = join(formFilePath, '..', 'use-generated.ts');
  const consumerSource = `import '${pkg}';\nimport { ${exportName} } from './${formModuleBasename}';\nexport const _config = ${exportName};\n`;
  writeFileSync(consumerFilePath, consumerSource);

  const options: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    noEmit: true,
    skipLibCheck: true,
    experimentalDecorators: true,
    allowImportingTsExtensions: false,
    baseUrl: repoRoot,
    paths: resolveCompilerPaths(adapter),
    // Ensure the adapter's module augmentation is loaded (the side-effect import in the
    // companion file alone isn't enough — TS tree-shakes unused .d.ts files).
    types: [],
  };

  const host = ts.createCompilerHost(options);
  const program = ts.createProgram([formFilePath, consumerFilePath], options, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);

  return diagnostics.map((d) => {
    const msg = ts.flattenDiagnosticMessageText(d.messageText, '\n');
    if (d.file && d.start !== undefined) {
      const { line, character } = d.file.getLineAndCharacterOfPosition(d.start);
      return `${d.file.fileName}:${line + 1}:${character + 1} - ${msg}`;
    }
    return msg;
  });
}

/**
 * Write a tsconfig next to a generated form that mirrors the compile options used by
 * `typecheckGeneratedForm`. Editors and ad-hoc `tsc` invocations pick up the same
 * adapter paths and module/resolution settings, so local inspection matches CI.
 */
export async function writeRepoRelativeTsconfig(outputDir: string, adapter: AdapterName = 'material'): Promise<void> {
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      experimentalDecorators: true,
      paths: resolveCompilerPaths(adapter),
      types: [],
    },
    include: ['**/*.ts'],
  };
  await writeFile(join(outputDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
}
