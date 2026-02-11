import { computed, Signal } from '@angular/core';
import { PageField } from '../../definitions/default/page-field';
import { buildClassName } from '../../utils/grid-classes/grid-classes';

/**
 * Maps a page field definition to component inputs.
 *
 * Page fields are layout containers that don't modify the form context.
 * The page component will inject FIELD_SIGNAL_CONTEXT directly.
 *
 * Note: Unlike other container mappers (group, row, array), the page mapper does NOT
 * resolve hidden logic here. Page visibility is managed by the {@link PageOrchestratorComponent}
 * which evaluates `ContainerLogicConfig` conditions and controls the `isVisible` input.
 *
 * @param fieldDef The page field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function pageFieldMapper(fieldDef: PageField): Signal<Record<string, unknown>> {
  const className = buildClassName(fieldDef);

  // Page inputs are static (no reactive dependencies)
  return computed(() => ({
    key: fieldDef.key,
    field: fieldDef,
    ...(className !== undefined && { className }),
  }));
}
