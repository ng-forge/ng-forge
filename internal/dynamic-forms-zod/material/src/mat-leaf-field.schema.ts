import { z } from 'zod';

// Import default leaf fields
import { TextFieldSchema } from '../../src/lib/schemas/leaves/text-field.schema';
import { HiddenFieldSchema } from '../../src/lib/schemas/leaves/hidden-field.schema';

// Import Material-specific fields
import { MatInputFieldSchema } from './fields/mat-input-field.schema';
import { MatTextareaFieldSchema } from './fields/mat-textarea-field.schema';
import { MatSelectFieldSchema } from './fields/mat-select-field.schema';
import { MatCheckboxFieldSchema } from './fields/mat-checkbox-field.schema';
import { MatRadioFieldSchema } from './fields/mat-radio-field.schema';
import { MatMultiCheckboxFieldSchema } from './fields/mat-multi-checkbox-field.schema';
import { MatToggleFieldSchema } from './fields/mat-toggle-field.schema';
import { MatSliderFieldSchema } from './fields/mat-slider-field.schema';
import { MatDatepickerFieldSchema } from './fields/mat-datepicker-field.schema';
import {
  MatButtonFieldSchema,
  MatSubmitButtonFieldSchema,
  MatNextButtonFieldSchema,
  MatPreviousButtonFieldSchema,
  MatAddArrayItemButtonFieldSchema,
  MatRemoveArrayItemButtonFieldSchema,
} from './fields/mat-button-field.schema';

/**
 * Discriminated union of all Material leaf field types.
 *
 * This schema validates any leaf field (non-container) for Material forms.
 * Container fields (page, row, group, array) are handled separately.
 */
export const MatLeafFieldSchema = z.discriminatedUnion('type', [
  // Default fields
  TextFieldSchema,
  HiddenFieldSchema,

  // Material value fields
  MatInputFieldSchema,
  MatTextareaFieldSchema,
  MatSelectFieldSchema,
  MatCheckboxFieldSchema,
  MatRadioFieldSchema,
  MatMultiCheckboxFieldSchema,
  MatToggleFieldSchema,
  MatSliderFieldSchema,
  MatDatepickerFieldSchema,

  // Material button fields
  MatButtonFieldSchema,
  MatSubmitButtonFieldSchema,
  MatNextButtonFieldSchema,
  MatPreviousButtonFieldSchema,
  MatAddArrayItemButtonFieldSchema,
  MatRemoveArrayItemButtonFieldSchema,
]);

/**
 * Inferred type for Material leaf fields.
 */
export type MatLeafFieldSchemaType = z.infer<typeof MatLeafFieldSchema>;

/**
 * List of all Material leaf field type names.
 */
export const MatLeafFieldTypes = [
  'text',
  'hidden',
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
  'addArrayItem',
  'removeArrayItem',
] as const;

export type MatLeafFieldType = (typeof MatLeafFieldTypes)[number];
