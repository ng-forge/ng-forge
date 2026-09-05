/**
 * Render an adapter's `props` reference from its descriptor.
 *
 * The hand-written `UI_ADAPTERS` registry covered five field types for Material
 * and two for Bootstrap. The descriptor covers twenty for each, because it is
 * derived from the types rather than typed out, so it cannot fall behind them.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  AdapterDescriptor,
  DescriptorObject,
  DescriptorProperty,
  DescriptorType,
} from '../internal/dynamic-forms-validation/descriptor/descriptor.types.ts';

const GENERATED = join(import.meta.dirname, '..', 'internal', 'dynamic-forms-validation', 'descriptor', 'generated');

export function readAdapterDescriptor(library: string): AdapterDescriptor {
  return JSON.parse(readFileSync(join(GENERATED, `${library}.json`), 'utf-8'));
}

/**
 * A descriptor type as a developer would write it.
 *
 * `opaque` renders as the type's own name where there is one. That is honest —
 * the property exists and has that type — and more useful than `unknown`, which
 * reads as "anything goes" when the truth is "we could not check this
 * statically".
 */
export function renderType(type: DescriptorType): string {
  switch (type.kind) {
    case 'string':
    case 'number':
    case 'boolean':
      return type.kind;
    case 'enum':
      return type.values.map((value) => (typeof value === 'string' ? `'${value}'` : String(value))).join(' | ');
    case 'array':
      return `${renderType(type.of)}[]`;
    case 'union':
      return type.of.map(renderType).join(' | ');
    case 'field':
      return 'FieldDef';
    case 'ref':
      return type.name;
    case 'never':
      return 'never';
    case 'unknown':
      return 'unknown';
    case 'opaque':
      return type.as ?? 'unknown';
  }
}

/** A property row: required, narrowed, or forbidden, said plainly. */
function renderProperty(name: string, property: DescriptorProperty, cell: (value: string) => string): string {
  if (property.type.kind === 'never') {
    return `| \`${cell(name)}\` | — | forbidden | Not supported on this field type. |`;
  }

  const note = property.narrowedFrom
    ? `Written as a string in a config; the ${property.narrowedFrom} type also allows values that cannot be serialised.`
    : '';

  return `| \`${cell(name)}\` | \`${cell(renderType(property.type))}\` | ${property.required ? 'yes' : 'no'} | ${cell(note)} |`;
}

function renderObject(fieldType: string, props: DescriptorObject, cell: (value: string) => string): string[] {
  const names = Object.keys(props.keys).sort();
  if (names.length === 0) return [];

  const lines = [`## \`${fieldType}\``, ''];
  lines.push('| Prop | Type | Required | Notes |');
  lines.push('| ---- | ---- | -------- | ----- |');
  for (const name of names) lines.push(renderProperty(name, props.keys[name], cell));
  lines.push('');

  return lines;
}

export interface PropsDocDeps {
  generatedNote: string;
  cell: (value: string) => string;
  withTableOfContents: (content: string) => string;
  label: string;
}

/** The whole props reference for one adapter. */
export function adapterPropsFromDescriptor(descriptor: AdapterDescriptor, deps: PropsDocDeps): string {
  const lines: string[] = [deps.generatedNote, '', `# ${deps.label} field properties`, ''];

  lines.push(
    `These keys go inside \`props\`. Everything else about a field — its \`key\`,`,
    '`type`, `label`, validation and logic — is adapter independent and documented',
    'in the core skill.',
    '',
    `Derived from \`${descriptor.adapter.package}\` ${descriptor.adapter.version}, so this list is`,
    'what the types actually declare rather than a copy maintained beside them.',
    '',
  );

  for (const fieldType of Object.keys(descriptor.props).sort()) {
    lines.push(...renderObject(fieldType, descriptor.props[fieldType], deps.cell));
  }

  if (descriptor.unresolved.length > 0) {
    lines.push('## Properties this reference cannot describe', '');
    lines.push(
      'These exist and are accepted, but their type cannot be written in a static',
      'config, so nothing here constrains them.',
      '',
    );
    for (const entry of descriptor.unresolved) {
      lines.push(`- ${deps.cell(entry.paths.join(', '))} — ${deps.cell(entry.reason)}`);
    }
    lines.push('');
  }

  return deps.withTableOfContents(lines.join('\n'));
}
