import { computed, inject, Signal } from '@angular/core';
import { ContainerField } from '../../definitions/default/container-field';
import { buildClassName } from '../../utils/grid-classes/grid-classes';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { injectNonFieldEvaluationContext } from '../../core/logic/non-field-logic-resolver';
import { applyHiddenLogic } from '../apply-hidden-logic';

/**
 * Maps a container field definition to component inputs.
 *
 * @param fieldDef The container field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function containerFieldMapper(fieldDef: ContainerField): Signal<Record<string, unknown>> {
  const rootFormRegistry = inject(RootFormRegistryService);
  const evaluationContext = injectNonFieldEvaluationContext(fieldDef, { scopeToArrayItem: true });
  const className = buildClassName(fieldDef);

  return computed(() => {
    // Nullify wrapper-related props on the field passed to the container
    // component — DfFieldOutlet handles field-level wrappers at the outlet
    // level. Passing them here would cause double-wrapping since the
    // container's internal wrapper chain also resolves from `this.field()`.
    // We set wrappers to undefined (not stripped) so the object identity
    // stays close to the original fieldDef shape.
    const containerField = { ...fieldDef, wrappers: undefined, skipAutoWrappers: undefined, skipDefaultWrappers: undefined };

    const inputs: Record<string, unknown> = {
      key: fieldDef.key,
      field: containerField,
      ...(className !== undefined && { className }),
    };

    applyHiddenLogic(inputs, fieldDef, rootFormRegistry, evaluationContext);

    return inputs;
  });
}
