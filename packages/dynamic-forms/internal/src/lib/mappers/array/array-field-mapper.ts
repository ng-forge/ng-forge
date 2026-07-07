import { computed, inject, Signal } from '@angular/core';
import { ArrayField } from '../../definitions/default/array-field';
import { buildClassName } from '../../utils/grid-classes/grid-classes';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { injectNonFieldEvaluationContext } from '../../core/logic/non-field-logic-resolver';
import { applyHiddenLogic } from '../apply-hidden-logic';

/**
 * Maps an array field definition to component inputs.
 *
 * @param fieldDef The array field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function arrayFieldMapper(fieldDef: ArrayField): Signal<Record<string, unknown>> {
  const rootFormRegistry = inject(RootFormRegistryService);
  const evaluationContext = injectNonFieldEvaluationContext(fieldDef, { scopeToArrayItem: true });
  const className = buildClassName(fieldDef);

  return computed(() => {
    const inputs: Record<string, unknown> = {
      key: fieldDef.key,
      field: fieldDef,
      ...(className !== undefined && { className }),
    };

    applyHiddenLogic(inputs, fieldDef, rootFormRegistry, evaluationContext);

    return inputs;
  });
}
