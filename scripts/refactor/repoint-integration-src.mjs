#!/usr/bin/env node
/**
 * Phase 2: in integration/src, repoint imports of /internal-owned symbols from
 * the main specifier '@ng-forge/dynamic-forms' to '@ng-forge/dynamic-forms/internal'.
 * Main-local symbols (EventBus, FormEvent, DynamicFormLogger, dynamicTextToObservable,
 * the addon-registry tokens, etc.) STAY on the main specifier.
 * DRY by default; --write to apply.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const WRITE = process.argv.includes('--write');
const ROOT = resolve('packages/dynamic-forms/integration/src');
const MAIN = '@ng-forge/dynamic-forms';
const INT = '@ng-forge/dynamic-forms/internal';

// Symbols owned by /internal (config types, tokens, mappers, kernel utils, base contracts).
const INTERNAL_OWNED = new Set([
  'buildBaseInputs',
  'baseFieldMapper',
  'DEFAULT_PROPS',
  'DEFAULT_VALIDATION_MESSAGES',
  'DEFAULT_WRAPPERS',
  'ARRAY_CONTEXT',
  'GROUP_CONTEXT',
  'FORM_OPTIONS',
  'FIELD_SIGNAL_CONTEXT',
  'injectFieldSignalContext',
  'FieldSignalContext',
  'FIELD_REGISTRY',
  'FieldTypeDefinition',
  'FieldScope',
  'ValueHandlingMode',
  'RootFormRegistryService',
  'interpolateParams',
  'applyMetaToElement',
  'isEqual',
  'omit',
  'resolveDynamicValue',
  'getArrayLength',
  'toReadonlyFieldTree',
  'writeToFieldValue',
  'ArrayFieldTree',
  'ReadonlyFieldTree',
  'FieldDef',
  'FieldMeta',
  'FieldOption',
  'DynamicText',
  'ValidationMessages',
  'AnyAddon',
  'TextAddon',
  'TemplateAddon',
  'BaseCheckedField',
  'BaseValueField',
  'CheckedFieldComponent',
  'ValueFieldComponent',
  'ValueType',
  'StateLogicConfig',
  'NonFieldLogicConfig',
  'ArrayAllowedChildren',
  'AddonActionContext',
  'FieldStateInfo',
  'FieldStateContext',
  'FormFieldStateMap',
  'ArrayContext',
  'MapperFn',
  'withPreviousValue',
]);

const walk = (d, a = []) => {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p, a) : p.endsWith('.ts') && a.push(p);
  }
  return a;
};
const IMP = /import\s+(type\s+)?\{([^}]*)\}\s*from\s*['"]@ng-forge\/dynamic-forms['"]\s*;?/g;

let filesChanged = 0,
  moved = 0;
for (const file of walk(ROOT)) {
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
      (INTERNAL_OWNED.has(name) ? move : stay).push(it);
    }
    if (!move.length) return full;
    changed = true;
    moved += move.length;
    const kw = typeKw ? 'type ' : '';
    const lines = [];
    if (stay.length) lines.push(`import ${kw}{ ${stay.join(', ')} } from '${MAIN}';`);
    lines.push(`import ${kw}{ ${move.join(', ')} } from '${INT}';`);
    return lines.join('\n');
  });
  if (changed) {
    filesChanged++;
    if (WRITE) writeFileSync(file, out);
  }
}
console.log(`repoint-integration-src ${WRITE ? 'WRITE' : 'DRY'}: files=${filesChanged} moved=${moved}`);
