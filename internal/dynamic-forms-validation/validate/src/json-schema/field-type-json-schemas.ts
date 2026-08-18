import { z } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

// Import leaf field schemas from each UI integration
import { MatLeafFieldSchema } from '../../../material/src';
import { BsLeafFieldSchema } from '../../../bootstrap/src';
import { PrimeLeafFieldSchema } from '../../../primeng/src';
import { IonicLeafFieldSchema } from '../../../ionic/src';

// Import individual field schemas for Material
import {
  MatInputFieldSchema,
  MatTextareaFieldSchema,
  MatSelectFieldSchema,
  MatCheckboxFieldSchema,
  MatRadioFieldSchema,
  MatMultiCheckboxFieldSchema,
  MatToggleFieldSchema,
  MatSliderFieldSchema,
  MatDatepickerFieldSchema,
  MatButtonFieldSchema,
  MatSubmitButtonFieldSchema,
  MatNextButtonFieldSchema,
  MatPreviousButtonFieldSchema,
} from '../../../material/src/fields';

// Import individual field schemas for Bootstrap
import {
  BsInputFieldSchema,
  BsTextareaFieldSchema,
  BsSelectFieldSchema,
  BsCheckboxFieldSchema,
  BsRadioFieldSchema,
  BsMultiCheckboxFieldSchema,
  BsToggleFieldSchema,
  BsSliderFieldSchema,
  BsDatepickerFieldSchema,
  BsButtonFieldSchema,
  BsSubmitButtonFieldSchema,
  BsNextButtonFieldSchema,
  BsPreviousButtonFieldSchema,
} from '../../../bootstrap/src/fields';

// Import individual field schemas for PrimeNG
import {
  PrimeInputFieldSchema,
  PrimeTextareaFieldSchema,
  PrimeSelectFieldSchema,
  PrimeCheckboxFieldSchema,
  PrimeRadioFieldSchema,
  PrimeMultiCheckboxFieldSchema,
  PrimeToggleFieldSchema,
  PrimeSliderFieldSchema,
  PrimeDatepickerFieldSchema,
  PrimeButtonFieldSchema,
  PrimeSubmitButtonFieldSchema,
  PrimeNextButtonFieldSchema,
  PrimePreviousButtonFieldSchema,
} from '../../../primeng/src/fields';

// Import individual field schemas for Ionic
import {
  IonicInputFieldSchema,
  IonicTextareaFieldSchema,
  IonicSelectFieldSchema,
  IonicCheckboxFieldSchema,
  IonicRadioFieldSchema,
  IonicMultiCheckboxFieldSchema,
  IonicToggleFieldSchema,
  IonicSliderFieldSchema,
  IonicDatepickerFieldSchema,
  IonicButtonFieldSchema,
  IonicSubmitButtonFieldSchema,
  IonicNextButtonFieldSchema,
  IonicPreviousButtonFieldSchema,
} from '../../../ionic/src/fields';

import type { UiIntegration, JsonSchemaType } from './form-config-json-schema';

/**
 * Supported field types for individual schema lookup.
 */
export type FieldType =
  | 'input'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'multi-checkbox'
  | 'toggle'
  | 'slider'
  | 'datepicker'
  | 'button'
  | 'submit'
  | 'next'
  | 'previous';

/**
 * Map of UI integration to leaf field schema.
 */
const leafFieldSchemas: Record<UiIntegration, z.ZodType> = {
  material: MatLeafFieldSchema,
  bootstrap: BsLeafFieldSchema,
  primeng: PrimeLeafFieldSchema,
  ionic: IonicLeafFieldSchema,
};

/**
 * Map of UI integration to individual field type schemas.
 */
const fieldTypeSchemas: Record<UiIntegration, Record<FieldType, z.ZodType>> = {
  material: {
    input: MatInputFieldSchema,
    textarea: MatTextareaFieldSchema,
    select: MatSelectFieldSchema,
    checkbox: MatCheckboxFieldSchema,
    radio: MatRadioFieldSchema,
    'multi-checkbox': MatMultiCheckboxFieldSchema,
    toggle: MatToggleFieldSchema,
    slider: MatSliderFieldSchema,
    datepicker: MatDatepickerFieldSchema,
    button: MatButtonFieldSchema,
    submit: MatSubmitButtonFieldSchema,
    next: MatNextButtonFieldSchema,
    previous: MatPreviousButtonFieldSchema,
  },
  bootstrap: {
    input: BsInputFieldSchema,
    textarea: BsTextareaFieldSchema,
    select: BsSelectFieldSchema,
    checkbox: BsCheckboxFieldSchema,
    radio: BsRadioFieldSchema,
    'multi-checkbox': BsMultiCheckboxFieldSchema,
    toggle: BsToggleFieldSchema,
    slider: BsSliderFieldSchema,
    datepicker: BsDatepickerFieldSchema,
    button: BsButtonFieldSchema,
    submit: BsSubmitButtonFieldSchema,
    next: BsNextButtonFieldSchema,
    previous: BsPreviousButtonFieldSchema,
  },
  primeng: {
    input: PrimeInputFieldSchema,
    textarea: PrimeTextareaFieldSchema,
    select: PrimeSelectFieldSchema,
    checkbox: PrimeCheckboxFieldSchema,
    radio: PrimeRadioFieldSchema,
    'multi-checkbox': PrimeMultiCheckboxFieldSchema,
    toggle: PrimeToggleFieldSchema,
    slider: PrimeSliderFieldSchema,
    datepicker: PrimeDatepickerFieldSchema,
    button: PrimeButtonFieldSchema,
    submit: PrimeSubmitButtonFieldSchema,
    next: PrimeNextButtonFieldSchema,
    previous: PrimePreviousButtonFieldSchema,
  },
  ionic: {
    input: IonicInputFieldSchema,
    textarea: IonicTextareaFieldSchema,
    select: IonicSelectFieldSchema,
    checkbox: IonicCheckboxFieldSchema,
    radio: IonicRadioFieldSchema,
    'multi-checkbox': IonicMultiCheckboxFieldSchema,
    toggle: IonicToggleFieldSchema,
    slider: IonicSliderFieldSchema,
    datepicker: IonicDatepickerFieldSchema,
    button: IonicButtonFieldSchema,
    submit: IonicSubmitButtonFieldSchema,
    next: IonicNextButtonFieldSchema,
    previous: IonicPreviousButtonFieldSchema,
  },
};

/**
 * Get all supported field types.
 */
export function getSupportedFieldTypes(): FieldType[] {
  return [
    'input',
    'textarea',
    'select',
    'checkbox',
    'radio',
    'multi-checkbox',
    'toggle',
    'slider',
    'datepicker',
    'button',
    'submit',
    'next',
    'previous',
  ];
}

/**
 * Get the JSON Schema for a specific field type.
 *
 * @param uiIntegration - The UI framework integration
 * @param fieldType - The field type to get schema for
 * @returns JSON Schema for the specific field type
 *
 * @example
 * ```typescript
 * const inputSchema = getFieldTypeJsonSchema('material', 'input');
 * // Returns only the input field schema (~25KB instead of ~258KB)
 * ```
 */
export function getFieldTypeJsonSchema(uiIntegration: UiIntegration, fieldType: FieldType): JsonSchemaType {
  const schemas = fieldTypeSchemas[uiIntegration];

  if (!schemas) {
    throw new Error(`Unknown UI integration: ${uiIntegration}. Valid: material, bootstrap, primeng, ionic`);
  }

  const schema = schemas[fieldType];

  if (!schema) {
    throw new Error(`Unknown field type: ${fieldType}. Valid: ${getSupportedFieldTypes().join(', ')}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonSchema = (zodToJsonSchema as any)(schema, {
    name: `${uiIntegration}${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)}Field`,
    $refStrategy: 'none',
    errorMessages: true,
  });

  return jsonSchema as JsonSchemaType;
}

/**
 * Get the JSON Schema for all leaf fields of a UI integration (full union).
 *
 * WARNING: This returns a large schema (~258KB). Consider using
 * getFieldTypeJsonSchema() for individual field types instead.
 *
 * @param uiIntegration - The UI framework integration
 * @returns JSON Schema for all leaf field types
 */
export function getLeafFieldJsonSchema(uiIntegration: UiIntegration): JsonSchemaType {
  const schema = leafFieldSchemas[uiIntegration];

  if (!schema) {
    throw new Error(`Unknown UI integration: ${uiIntegration}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jsonSchema = (zodToJsonSchema as any)(schema, {
    name: `${uiIntegration}LeafField`,
    $refStrategy: 'none',
    errorMessages: true,
  });

  return jsonSchema as JsonSchemaType;
}

/**
 * Get JSON Schemas for leaf fields of all UI integrations.
 *
 * @returns Map of UI integration to leaf field JSON Schema
 */
export function getAllLeafFieldJsonSchemas(): Record<UiIntegration, JsonSchemaType> {
  return {
    material: getLeafFieldJsonSchema('material'),
    bootstrap: getLeafFieldJsonSchema('bootstrap'),
    primeng: getLeafFieldJsonSchema('primeng'),
    ionic: getLeafFieldJsonSchema('ionic'),
  };
}
