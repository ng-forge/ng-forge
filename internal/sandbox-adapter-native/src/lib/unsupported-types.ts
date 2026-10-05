import type { FormConfig } from '@ng-forge/dynamic-forms';

interface Registries {
  fields: ReadonlyMap<string, unknown>;
  addons: ReadonlyMap<string, unknown>;
  wrappers: ReadonlyMap<string, unknown>;
}

type Node = { type?: unknown; fields?: unknown; template?: unknown; addons?: unknown; wrappers?: unknown };

/**
 * What a config uses that the native fields do not register: field, addon and wrapper types, as
 * `select`, `addon: mat-icon` or `wrapper: section`. Empty when the config renders on native.
 */
export function unsupportedTypes(config: FormConfig, registries: Registries): string[] {
  const missing = new Set<string>();
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== 'object') return;
    const node = value as Node;
    if (typeof node.type === 'string' && !registries.fields.has(node.type)) missing.add(node.type);
    for (const addon of asArray(node.addons)) {
      const type = (addon as Node).type;
      if (typeof type === 'string' && !registries.addons.has(type)) missing.add(`addon: ${type}`);
    }
    for (const wrapper of asArray(node.wrappers)) {
      const type = typeof wrapper === 'string' ? wrapper : (wrapper as Node).type;
      if (typeof type === 'string' && !registries.wrappers.has(type)) missing.add(`wrapper: ${type}`);
    }
    visit(node.fields);
    visit(node.template);
  };
  visit(config.fields);
  return [...missing];
}

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
