import { computed, inject, Signal } from '@angular/core';
import { TextField } from '../../definitions/default/text-field';
import { buildBaseInputs } from '../base/base-field-mapper';
import { FunctionRegistryService } from '../../core/registry/function-registry.service';
import { FieldContextRegistryService } from '../../core/registry/field-context-registry.service';
import { evaluateCondition } from '../../core/expressions/condition-evaluator';
import { ConditionalExpression } from '../../models/expressions/conditional-expression';
import { DYNAMIC_FORM_LOGGER } from '../../providers/features/logger/logger.token';

/**
 * Maps a text field definition to component inputs.
 *
 * Text fields are display-only fields that don't participate in the form schema.
 * This mapper handles the `logic` configuration by creating reactive signals
 * that evaluate conditions using the form value from RootFormRegistryService.
 *
 * @param fieldDef The text field definition
 * @returns Signal containing Record of input names to values for ngComponentOutlet
 */
export function textFieldMapper(fieldDef: TextField): Signal<Record<string, unknown>> {
  const fieldContextRegistry = inject(FieldContextRegistryService);
  const functionRegistry = inject(FunctionRegistryService);
  const logger = inject(DYNAMIC_FORM_LOGGER);

  // Build base inputs (static, from field definition)
  const baseInputs = buildBaseInputs(fieldDef);

  // Create computed signal for hidden state based on logic configuration
  const hiddenLogic = fieldDef.logic?.filter((l) => l.type === 'hidden') ?? [];

  // Return computed signal for reactive updates
  return computed(() => {
    const inputs: Record<string, unknown> = { ...baseInputs };

    // Evaluate hidden logic if present
    if (hiddenLogic.length > 0) {
      // Use centralized context creation for display-only components
      const evaluationContext = fieldContextRegistry.createDisplayOnlyContext(fieldDef.key, functionRegistry.getCustomFunctions());

      // Evaluate all hidden logic conditions - if ANY is true, the field is hidden
      inputs['hidden'] = hiddenLogic.some((logic) => {
        if (typeof logic.condition === 'boolean') {
          return logic.condition;
        }
        return evaluateCondition(logic.condition as ConditionalExpression, evaluationContext);
      });
    }

    return inputs;
  });
}
