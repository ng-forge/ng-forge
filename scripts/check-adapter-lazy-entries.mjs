import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const adapter = process.argv[2];
const expectedEntries = {
  bootstrap: [
    'input',
    'select',
    'checkbox',
    'button',
    'textarea',
    'radio',
    'multi-checkbox',
    'datepicker',
    'slider',
    'toggle',
    'addon-icon',
    'addon-button',
  ],
  material: [
    'input',
    'select',
    'checkbox',
    'button',
    'textarea',
    'radio',
    'multi-checkbox',
    'datepicker',
    'slider',
    'toggle',
    'addon-icon',
    'addon-button',
  ],
  primeng: [
    'input',
    'select',
    'checkbox',
    'button',
    'textarea',
    'radio',
    'multi-checkbox',
    'datepicker',
    'slider',
    'toggle',
    'addon-icon',
    'addon-button',
  ],
  ionic: [
    'input',
    'select',
    'checkbox',
    'button',
    'textarea',
    'radio',
    'multi-checkbox',
    'datepicker',
    'slider',
    'toggle',
    'addon-icon',
    'addon-button',
  ],
};

if (!adapter || !(adapter in expectedEntries)) {
  throw new Error(`Unknown adapter '${adapter ?? ''}'. Expected one of: ${Object.keys(expectedEntries).join(', ')}`);
}

const packageRoot = resolve(`dist/packages/dynamic-forms-${adapter}`);
const manifest = JSON.parse(await readFile(resolve(packageRoot, 'package.json'), 'utf8'));
const failures = [];

if (manifest.sideEffects !== false) {
  failures.push(`package.json sideEffects must be false, received ${JSON.stringify(manifest.sideEffects)}`);
}

const primaryModulePath = resolve(packageRoot, manifest.exports['.'].default);
const primaryModule = await readFile(primaryModulePath, 'utf8');

for (const entry of expectedEntries[adapter]) {
  const specifier = `${manifest.name}/lazy/${entry}`;
  if (!primaryModule.includes(`import('${specifier}')`) && !primaryModule.includes(`import("${specifier}")`)) {
    failures.push(`primary entry point does not retain a dynamic import for ${specifier}`);
  }
  if (primaryModule.includes(`from '${specifier}'`) || primaryModule.includes(`from "${specifier}"`)) {
    failures.push(`primary entry point statically re-exports ${specifier}`);
  }
}

const declarationPath = resolve(packageRoot, manifest.exports['.'].types);
const declarations = await readFile(declarationPath, 'utf8');
if (!declarations.includes('interface FieldRegistryLeaves')) {
  failures.push('rolled declarations do not contain the FieldRegistryLeaves module augmentation');
}

const sharedDeclarationPath = resolve(packageRoot, manifest.exports['./shared'].types);
const sharedDeclarations = await readFile(sharedDeclarationPath, 'utf8');
if (!sharedDeclarations.includes('interface DynamicFormAddonRegistry')) {
  failures.push('shared declarations do not contain the DynamicFormAddonRegistry module augmentation');
}

if (failures.length > 0) {
  throw new Error(`Lazy adapter package contract failed for ${manifest.name}:\n- ${failures.join('\n- ')}`);
}

console.log(`Lazy adapter package contract passed for ${manifest.name} (${expectedEntries[adapter].length} lazy entries).`);
