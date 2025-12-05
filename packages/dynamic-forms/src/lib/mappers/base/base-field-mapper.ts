import { computed, Signal } from '@angular/core';
import { FieldDef } from '../../definitions/base/field-def';
import { getGridClassString } from '../../utils/grid-classes/grid-classes';

const validationKeys = new Set(['required', 'email', 'min', 'max', 'minLength', 'maxLength', 'pattern', 'validators', 'logic']);

const excludedKeys = new Set([
  'col',
  'type',
  'conditionals',
  'validation',
  'label',
  'className',
  'tabIndex',
  'props',
  'disabled',
  'readonly',
  'hidden',
  'required',
  'minValue', // Handled by Field directive metadata (MIN)
  'maxValue', // Handled by Field directive metadata (MAX)
  'step', // Passed via props instead
  'validationMessages', // Handled in value/checkbox mappers
  'defaultValue', // Used for form reset/clear, not passed to components
  'arrayKey',
  'schemas', // Handled at form level by SchemaRegistryService
]);

/**
 * Builds base input properties from a field definition.
 *
 * This is a helper function that extracts common field properties.
 * Used by mappers to build the inputs record.
 *
 * @param fieldDef The field definition to extract properties from
 * @returns Record of input names to values
 */
export function buildBaseInputs(fieldDef: FieldDef<unknown>): Record<string, unknown> {
  const { label, className, tabIndex, props } = fieldDef;
  const inputs: Record<string, unknown> = {};

  if (label !== undefined) {
    inputs['label'] = label;
  }

  // Combine user className with generated grid classes
  const gridClassString = getGridClassString(fieldDef);
  const allClasses: string[] = [];

  if (gridClassString) {
    allClasses.push(gridClassString);
  }

  if (className) {
    allClasses.push(className);
  }

  if (allClasses.length > 0) {
    inputs['className'] = allClasses.join(' ');
  }

  if (tabIndex !== undefined) {
    inputs['tabIndex'] = tabIndex;
  }

  if (props !== undefined) {
    inputs['props'] = props;
  }

  for (const [key, value] of Object.entries(fieldDef)) {
    if (!excludedKeys.has(key) && !validationKeys.has(key) && value !== undefined) {
      inputs[key] = value;
    }
  }

  return inputs;
}

/**
 * Base field mapper that extracts common field properties into component inputs.
 *
 * Returns a Signal containing the Record of input names to values that will be
 * passed to ngComponentOutlet. The signal enables reactive updates.
 *
 * @param fieldDef The field definition to map
 * @returns Signal containing Record of input names to values
 */
export function baseFieldMapper(fieldDef: FieldDef<unknown>): Signal<Record<string, unknown>> {
  // For base mapper, inputs are static (no reactive dependencies)
  // Wrap in computed for consistency with the MapperFn type
  return computed(() => buildBaseInputs(fieldDef));
}
