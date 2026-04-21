import { mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
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
export function typecheckGeneratedForm(
  formFilePath: string,
  adapter: 'material' | 'bootstrap' | 'primeng' | 'ionic' = 'material',
): string[] {
  const repoRoot = resolve(__dirname, '../../../../..');
  const dynamicFormsDist = resolve(repoRoot, 'dist/packages/dynamic-forms');
  const adapterDist = resolve(repoRoot, `dist/packages/dynamic-forms-${adapter}`);
  const adapterPkg = `@ng-forge/dynamic-forms-${adapter}`;
  // ng-packagr places typings under types/<pkg-name>.d.ts; point `paths` at that file
  // directly so module augmentation is picked up regardless of NodeNext resolution quirks.
  const adapterTypings = resolve(adapterDist, `types/ng-forge-dynamic-forms-${adapter}.d.ts`);

  // Write a companion file that activates the adapter registry via side-effect import.
  // Mirrors the user's app-level `import '@ng-forge/dynamic-forms-material'` (or the
  // equivalent `types` entry in tsconfig) that issue #341 surfaced.
  const consumerFilePath = join(formFilePath, '..', 'use-generated.ts');
  const consumerSource = `import '${adapterPkg}';\nimport { createUserFormConfig } from './create-user.form';\nexport const _config = createUserFormConfig;\n`;
  // Sync write — fs/promises is overkill for a small shim inside a single test

  require('node:fs').writeFileSync(consumerFilePath, consumerSource);

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
    paths: {
      '@ng-forge/dynamic-forms': [dynamicFormsDist],
      '@ng-forge/dynamic-forms/integration': [join(dynamicFormsDist, 'integration')],
      [adapterPkg]: [adapterTypings.replace(/\.d\.ts$/, '')],
    },
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
 * Write a small tsconfig file next to a generated form so that editors and ad-hoc
 * tsc invocations can resolve the package paths the same way `typecheckGeneratedForm` does.
 *
 * Primarily used when extending the test with additional consumer code.
 */
export async function writeRepoRelativeTsconfig(outputDir: string): Promise<void> {
  const repoRoot = resolve(__dirname, '../../../../..');
  const tsconfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      paths: {
        '@ng-forge/dynamic-forms': [resolve(repoRoot, 'dist/packages/dynamic-forms')],
        '@ng-forge/dynamic-forms/integration': [resolve(repoRoot, 'dist/packages/dynamic-forms/integration')],
      },
    },
    include: ['**/*.ts'],
  };
  await writeFile(join(outputDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
}
