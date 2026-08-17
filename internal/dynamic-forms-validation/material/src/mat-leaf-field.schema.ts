import { z } from 'zod';

// Import default leaf fields
import { TextFieldSchema } from '../../src/lib/schemas/leaves/text-field.schema.js';
import { HiddenFieldSchema } from '../../src/lib/schemas/leaves/hidden-field.schema.js';
import { nullableValueRefine } from '../../src/lib/schemas/field/nullable-value.refinement.js';

// Import Material-specific fields.
// For value-bearing fields, we import the raw `<X>FieldSchemaObject` variants —
// discriminatedUnion requires ZodObject members (ZodEffects from .superRefine is rejected).
// The refinement still runs at the union level via `.superRefine(nullableValueRefine)` below,
// and individual-schema direct-parse gets the refinement via the public `<X>FieldSchema` export.
import { MatInputFieldSchemaObject } from './fields/mat-input-field.schema.js';
import { MatTextareaFieldSchemaObject } from './fields/mat-textarea-field.schema.js';
import { MatSelectFieldSchemaObject } from './fields/mat-select-field.schema.js';
import { MatCheckboxFieldSchema } from './fields/mat-checkbox-field.schema.js';
import { MatRadioFieldSchemaObject } from './fields/mat-radio-field.schema.js';
import { MatMultiCheckboxFieldSchemaObject } from './fields/mat-multi-checkbox-field.schema.js';
import { MatToggleFieldSchema } from './fields/mat-toggle-field.schema.js';
import { MatSliderFieldSchemaObject } from './fields/mat-slider-field.schema.js';
import { MatDatepickerFieldSchemaObject } from './fields/mat-datepicker-field.schema.js';
import {
  MatButtonFieldSchema,
  MatSubmitButtonFieldSchema,
  MatNextButtonFieldSchema,
  MatPreviousButtonFieldSchema,
  MatAddArrayItemButtonFieldSchema,
  MatRemoveArrayItemButtonFieldSchema,
  MatPrependArrayItemButtonFieldSchema,
  MatInsertArrayItemButtonFieldSchema,
  MatPopArrayItemButtonFieldSchema,
  MatShiftArrayItemButtonFieldSchema,
} from './fields/mat-button-field.schema.js';

/**
 * Discriminated union of all Material leaf field types.
 *
 * This schema validates any leaf field (non-container) for Material forms.
 * Container fields (page, row, group, array) are handled separately.
 */
export const MatLeafFieldSchema = z
  .discriminatedUnion('type', [
    // Default fields
    TextFieldSchema,
    HiddenFieldSchema,

    // Material value fields
    MatInputFieldSchemaObject,
    MatTextareaFieldSchemaObject,
    MatSelectFieldSchemaObject,
    MatCheckboxFieldSchema,
    MatRadioFieldSchemaObject,
    MatMultiCheckboxFieldSchemaObject,
    MatToggleFieldSchema,
    MatSliderFieldSchemaObject,
    MatDatepickerFieldSchemaObject,

    // Material button fields
    MatButtonFieldSchema,
    MatSubmitButtonFieldSchema,
    MatNextButtonFieldSchema,
    MatPreviousButtonFieldSchema,
    MatAddArrayItemButtonFieldSchema,
    MatRemoveArrayItemButtonFieldSchema,
    MatPrependArrayItemButtonFieldSchema,
    MatInsertArrayItemButtonFieldSchema,
    MatPopArrayItemButtonFieldSchema,
    MatShiftArrayItemButtonFieldSchema,
  ])
  .superRefine(nullableValueRefine);

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
  'add-array-item',
  'prepend-array-item',
  'insert-array-item',
  'remove-array-item',
  'pop-array-item',
  'shift-array-item',
] as const;

export type MatLeafFieldType = (typeof MatLeafFieldTypes)[number];
