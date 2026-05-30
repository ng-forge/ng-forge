#!/usr/bin/env node
/**
 * Phase 2: repoint adapter (and other) imports of ADAPTER-TIER symbols from the
 * main specifier '@ng-forge/dynamic-forms' to '@ng-forge/dynamic-forms/integration'.
 *
 * Consumer-tier symbols (DynamicForm, provideDynamicForm, FormConfig, FieldDef,
 * events, etc.) STAY on the main specifier. Only the names in ADAPTER_TIER move.
 *
 * Splits mixed imports: an import line pulling both tiers becomes two lines.
 * DRY by default; --write to apply. Pass roots as args.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const WRITE = process.argv.includes('--write');
const ROOTS = process.argv
  .slice(2)
  .filter((a) => !a.startsWith('--'))
  .map((r) => resolve(r));
const MAIN = '@ng-forge/dynamic-forms';
const INT = '@ng-forge/dynamic-forms/integration';

// Symbols that live in the adapter tier (now exported from /integration).
const ADAPTER_TIER = new Set([
  // mappers
  'baseFieldMapper',
  'buildBaseInputs',
  'arrayFieldMapper',
  'groupFieldMapper',
  'pageFieldMapper',
  'rowFieldMapper',
  'textFieldMapper',
  'containerFieldMapper',
  'ArrayContext',
  'FieldSignalContext',
  'MapperFn',
  // registration
  'FieldScope',
  'FieldTypeDefinition',
  'ValueHandlingMode',
  'FIELD_REGISTRY',
  // base component contracts
  'ValueFieldComponent',
  'CheckedFieldComponent',
  // tokens
  'ARRAY_CONTEXT',
  'DEFAULT_PROPS',
  'DEFAULT_VALIDATION_MESSAGES',
  'DEFAULT_WRAPPERS',
  'FIELD_SIGNAL_CONTEXT',
  'FORM_OPTIONS',
  'GROUP_CONTEXT',
  'injectFieldSignalContext',
  // fieldtree
  'getArrayLength',
  'toReadonlyFieldTree',
  'writeToFieldValue',
  'ArrayFieldTree',
  'ReadonlyFieldTree',
  // services / utils
  'RootFormRegistryService',
  'interpolateParams',
  'applyMetaToElement',
  'resolveDynamicValue',
  'FieldStateInfo',
  'FieldStateContext',
  'FormFieldStateMap',
  // main-local but adapter-only, re-exported via /integration
  'EventBus',
  'resolveTokens',
  'applyValidator',
  'applyValidators',
  'HttpResourceRequest',
  'BUILT_IN_FIELDS',
  'DynamicTextPipe',
  'dynamicTextToObservable',
  'runPresetAction',
  'PresetCollaborators',
  'ADDON_ACTION_REGISTRY',
  'ADDON_ACTION_HANDLERS',
  'AddonActionHandler',
  'ADDON_KIND_DEFINITIONS',
  'ADDON_KIND_REGISTRY',
  'ADDON_KIND_COMPONENT_CACHE',
  'injectAddonKindRegistry',
  'injectFieldsSupportingAddons',
  'FieldAddonSupportEntry',
  'INITIALIZATION_TIMEOUT_MS',
  'withPreviousValue',
  'WrapperFieldInputs',
]);

const walk = (d, a = []) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p, a) : p.endsWith('.ts') && a.push(p);
  }
  return a;
};

// Match: import [type] { ... } from '@ng-forge/dynamic-forms';
const IMP = /import\s+(type\s+)?\{([^}]*)\}\s*from\s*['"]@ng-forge\/dynamic-forms['"]\s*;?/g;

let filesChanged = 0,
  movedCount = 0;
const samples = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (file.endsWith('.d.ts')) continue;
    const src = readFileSync(file, 'utf8');
    if (!IMP.test(src)) continue;
    IMP.lastIndex = 0;
    let changed = false;
    const out = src.replace(IMP, (full, typeKw, body) => {
      const items = body
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const stay = [],
        move = [];
      for (const it of items) {
        const name = it
          .replace(/^type\s+/, '')
          .split(/\s+as\s+/)[0]
          .trim();
        (ADAPTER_TIER.has(name) ? move : stay).push(it);
      }
      if (move.length === 0) return full;
      changed = true;
      movedCount += move.length;
      const kw = typeKw ? 'type ' : '';
      const lines = [];
      if (stay.length) lines.push(`import ${kw}{ ${stay.join(', ')} } from '${MAIN}';`);
      lines.push(`import ${kw}{ ${move.join(', ')} } from '${INT}';`);
      if (samples.length < 12) samples.push(`${file.split('/packages/')[1]}: moved [${move.join(', ')}]`);
      return lines.join('\n');
    });
    if (changed) {
      filesChanged++;
      if (WRITE) writeFileSync(file, out);
    }
  }
}
console.log(`repoint-adapters ${WRITE ? 'WRITE' : 'DRY'}: files=${filesChanged} symbolsMoved=${movedCount}`);
for (const s of samples) console.log('  ' + s);
