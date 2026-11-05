import type { TemplateRef } from '@angular/core';
import type { FieldPlaceholderContext, ResolvedPlaceholders } from './df-placeholder.directive';
import type { ResolvedField } from '../../utils/resolve-field/resolve-field';

/**
 * Resolves the projected placeholder template for a windowed field, following
 * the cascade: a key match wins over a type match, which wins over the default
 * template. Returns `null` when nothing matches, so the caller renders the
 * built-in bare placeholder div (the pre-projection behaviour).
 */
export function resolvePlaceholderTemplate(
  placeholders: ResolvedPlaceholders,
  field: { key: string; type: string },
): TemplateRef<FieldPlaceholderContext> | null {
  return placeholders.byKey.get(field.key) ?? placeholders.byType.get(field.type) ?? placeholders.default ?? null;
}

/**
 * Returns a per-instance lookup for a windowed field's placeholder context.
 * Keyed by the field definition object, so a config change gives fresh label/type/col
 * while unchanged fields keep a stable context across change detection.
 */
export function createPlaceholderContextCache(): (field: ResolvedField) => FieldPlaceholderContext {
  const cache = new WeakMap<object, FieldPlaceholderContext>();
  return (field) => {
    let ctx = cache.get(field.fieldDef);
    if (!ctx) {
      const label = typeof field.fieldDef.label === 'string' ? field.fieldDef.label : undefined;
      const info = { key: field.key, type: field.fieldDef.type, label, col: field.fieldDef.col };
      ctx = { $implicit: info, field: info };
      cache.set(field.fieldDef, ctx);
    }
    return ctx;
  };
}
