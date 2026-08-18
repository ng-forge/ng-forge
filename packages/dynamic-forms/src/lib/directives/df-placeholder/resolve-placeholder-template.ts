import type { TemplateRef } from '@angular/core';
import type { FieldPlaceholderContext, ResolvedPlaceholders } from './df-placeholder.directive';

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
