import { computed, inject, Signal } from '@angular/core';
import { GroupField } from '../../definitions/default/group-field';
import { buildClassName } from '../../utils/grid-classes/grid-classes';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { injectNonFieldEvaluationContext } from '../../core/logic/non-field-logic-resolver';
import { applyHiddenLogic } from '../apply-hidden-logic';

/**
 * Maps a group field definition to component inputs.
 *
 * @param fieldDef The group field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function groupFieldMapper(fieldDef: GroupField): Signal<Record<string, unknown>> {
  const rootFormRegistry = inject(RootFormRegistryService);
  const evaluationContext = injectNonFieldEvaluationContext(fieldDef);
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
