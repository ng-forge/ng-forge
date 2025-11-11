import { Binding, computed, inputBinding } from '@angular/core';
import { FieldDef, FieldWithValidation } from '../../definitions';
import { baseFieldMapper } from '../base/base-field-mapper';
import { FieldMapperOptions } from '../types';
import { evaluateCondition } from '../../core';
import { ConditionalExpression, EvaluationContext } from '../../models';

export type TextFieldMapperOptions<TModel = unknown> = Omit<FieldMapperOptions<TModel>, 'fieldRegistry'>;

/**
 * Mapper for text fields that handles conditional logic for hidden state
 */
export function textFieldMapper<TProps, TModel = unknown>(fieldDef: FieldDef<TProps>, options: TextFieldMapperOptions<TModel>): Binding[] {
  const baseBindings = baseFieldMapper(fieldDef);

  // Handle hidden logic for text fields (non-form-control elements)
  const validationField = fieldDef as FieldDef<TProps> & FieldWithValidation;
  if (validationField.logic) {
    const hiddenLogic = validationField.logic.find((logic) => logic.type === 'hidden');

    if (hiddenLogic && hiddenLogic.condition) {
      if (typeof hiddenLogic.condition === 'boolean') {
        // Static boolean condition
        baseBindings.push(inputBinding('hidden', () => hiddenLogic.condition as boolean));
      } else {
        // Dynamic condition - create a computed signal that evaluates it
        const hiddenSignal = computed(() => {
          const form = options.fieldSignalContext.form();
          const formValue = form?.value() || {};

          // Create minimal evaluation context for text fields
          const context: EvaluationContext = {
            fieldValue: undefined, // Text fields don't have a field value
            formValue,
            fieldPath: '', // Text fields don't have a form path
            customFunctions: {},
          };

          return evaluateCondition(hiddenLogic.condition as ConditionalExpression, context);
        });

        baseBindings.push(inputBinding('hidden', hiddenSignal));
      }
    }
  }

  return baseBindings;
}
