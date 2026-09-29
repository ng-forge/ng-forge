import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { build } from 'esbuild';

const adapter = process.argv[2];
if (!adapter || !/^[a-z0-9-]+$/.test(adapter)) {
  throw new Error(`Invalid adapter '${adapter ?? ''}'. Expected a lowercase adapter name.`);
}

const sourceRoot = resolve(`packages/dynamic-forms-${adapter}`);
const packageRoot = resolve(`dist/packages/dynamic-forms-${adapter}`);
const expectedEntries = (await readdir(resolve(sourceRoot, 'lazy'), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const manifest = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
const failures = [];

if (manifest.sideEffects !== false) {
  failures.push(`package.json sideEffects must be false, received ${JSON.stringify(manifest.sideEffects)}`);
}

const primaryModulePath = resolve(packageRoot, manifest.exports['.'].default);
const primaryModule = await readFile(primaryModulePath, 'utf8');

const exportedEntries = Object.keys(manifest.exports)
  .filter((specifier) => specifier.startsWith('./lazy/'))
  .map((specifier) => specifier.slice('./lazy/'.length))
  .sort();

if (JSON.stringify(exportedEntries) !== JSON.stringify(expectedEntries)) {
  failures.push(
    `built lazy exports do not match source entry points (expected ${expectedEntries.join(', ')}, received ${exportedEntries.join(', ')})`,
  );
}

// A component's own type and selector sit before its first nested object, in any order. Selectors
// are what NG0912 compares, and they survive rollup renaming a duplicate class to `Foo$1`.
const declaredComponents = (source) =>
  [...source.matchAll(/ɵɵngDeclareComponent\(\{(?=[^}]*?\btype: ([\w$]+))(?=[^}]*?\bselector: "([^"]+)")/g)].map(([, name, selector]) => ({
    name,
    selector,
  }));
const primarySelectors = new Set(declaredComponents(primaryModule).map(({ selector }) => selector));
for (const entry of expectedEntries) {
  const specifier = `${manifest.name}/lazy/${entry}`;
  if (!primaryModule.includes(`import('${specifier}')`) && !primaryModule.includes(`import("${specifier}")`)) {
    failures.push(`primary entry point does not retain a dynamic import for ${specifier}`);
  }
  if (primaryModule.includes(`from '${specifier}'`) || primaryModule.includes(`from "${specifier}"`)) {
    failures.push(`primary entry point statically re-exports ${specifier}`);
  }
  // A second copy of a lazy component is a distinct class with the same component ID (NG0912, #625).
  const lazyModule = await readFile(resolve(packageRoot, manifest.exports[`./lazy/${entry}`].default), 'utf8');
  const lazyComponents = declaredComponents(lazyModule);
  // Every lazy entry renders a component, so zero matches means the partial-compilation format changed.
  if (lazyComponents.length === 0) {
    failures.push(`found no component declarations in ${specifier}; update the declaredComponents pattern`);
  }
  for (const { name, selector } of lazyComponents) {
    if (primarySelectors.has(selector)) {
      failures.push(`primary entry point redeclares ${name} ('${selector}') from ${specifier}`);
    }
  }
}

// Bundle a consumer that keeps every root export, then walk the static import graph from its entry
// chunk. No lazy entry module may be reachable without a dynamic import, including through another
// entry point such as /shared, which the string check above cannot see.
const lazyInputs = new Set(
  expectedEntries.map((entry) => relative(process.cwd(), resolve(packageRoot, manifest.exports[`./lazy/${entry}`].default))),
);
const { metafile } = await build({
  stdin: { contents: `import * as adapter from '${manifest.name}';\nconsole.log(adapter);`, resolveDir: packageRoot },
  bundle: true,
  splitting: true,
  format: 'esm',
  outdir: 'out',
  write: false,
  metafile: true,
  logLevel: 'silent',
  plugins: [
    {
      name: 'resolve-adapter',
      setup(pluginBuild) {
        pluginBuild.onResolve({ filter: /^[^./]/ }, ({ path }) => {
          if (path !== manifest.name && !path.startsWith(`${manifest.name}/`)) return { path, external: true };
          // Plugin-resolved paths skip package.json lookup, so pass sideEffects through like a real install.
          return {
            path: resolve(packageRoot, manifest.exports[`.${path.slice(manifest.name.length)}`].default),
            sideEffects: manifest.sideEffects !== false,
          };
        });
      },
    },
  ],
});
const entryOutput = Object.keys(metafile.outputs).find((output) => metafile.outputs[output].entryPoint === '<stdin>');
if (!entryOutput) {
  throw new Error(`Eager bundle check for ${manifest.name} found no entry chunk in the esbuild metafile.`);
}
const eagerOutputs = new Set([entryOutput]);
for (const output of eagerOutputs) {
  for (const { path, kind } of metafile.outputs[output].imports) {
    if (kind === 'import-statement' && metafile.outputs[path]) eagerOutputs.add(path);
  }
}
for (const output of eagerOutputs) {
  for (const input of Object.keys(metafile.outputs[output].inputs)) {
    if (lazyInputs.has(input)) failures.push(`primary entry point eagerly bundles ${input}`);
  }
}

const declarationPath = resolve(packageRoot, manifest.exports['.'].types);
const declarations = await readFile(declarationPath, 'utf8');
if (!declarations.includes('interface FieldRegistryLeaves')) {
  failures.push('rolled declarations do not contain the FieldRegistryLeaves module augmentation');
}
// The bundle has no value exports from lazy entries, so the typings must not promise any.
for (const [statement] of declarations.matchAll(new RegExp(`^export \\{[^}]*\\} from '${manifest.name}/lazy/[^']+';$`, 'gm'))) {
  failures.push(`rolled declarations value-export a lazy entry: ${statement}`);
}

const sharedDeclarationPath = resolve(packageRoot, manifest.exports['./shared'].types);
const sharedDeclarations = await readFile(sharedDeclarationPath, 'utf8');
if (!sharedDeclarations.includes('interface DynamicFormAddonRegistry')) {
  failures.push('shared declarations do not contain the DynamicFormAddonRegistry module augmentation');
}

if (failures.length > 0) {
  throw new Error(`Lazy adapter package contract failed for ${manifest.name}:\n- ${failures.join('\n- ')}`);
}

console.log(`Lazy adapter package contract passed for ${manifest.name} (${expectedEntries.length} lazy entries).`);
