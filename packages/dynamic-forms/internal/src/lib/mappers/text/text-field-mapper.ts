import { computed, inject, Signal } from '@angular/core';
import { TextField } from '../../definitions/default/text-field';
import { buildBaseInputs } from '../base/base-field-mapper';
import { DEFAULT_PROPS } from '../../models/field-signal-context.token';
import { RootFormRegistryService } from '../../core/registry/root-form-registry.service';
import { injectNonFieldEvaluationContext } from '../../core/logic/non-field-logic-resolver';
import { applyHiddenLogic } from '../apply-hidden-logic';

/**
 * Maps a text field definition to component inputs.
 *
 * @param fieldDef The text field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function textFieldMapper(fieldDef: TextField): Signal<Record<string, unknown>> {
  const rootFormRegistry = inject(RootFormRegistryService);
  const evaluationContext = injectNonFieldEvaluationContext(fieldDef);
  const defaultProps = inject(DEFAULT_PROPS);

  // Return computed signal for reactive updates
  return computed(() => {
    const baseInputs = buildBaseInputs(fieldDef, defaultProps());
    const inputs: Record<string, unknown> = { ...baseInputs };

    applyHiddenLogic(inputs, fieldDef, rootFormRegistry, evaluationContext);

    return inputs;
  });
}
