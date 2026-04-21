import { z } from 'zod';

// Import default leaf fields
import { TextFieldSchema } from '../../src/lib/schemas/leaves/text-field.schema';
import { HiddenFieldSchema } from '../../src/lib/schemas/leaves/hidden-field.schema';
import { nullableValueRefine } from '../../src/lib/schemas/field/nullable-value.refinement';

// Import Material-specific fields.
// For value-bearing fields, we import the raw `<X>FieldSchemaObject` variants —
// discriminatedUnion requires ZodObject members (ZodEffects from .superRefine is rejected).
// The refinement still runs at the union level via `.superRefine(nullableValueRefine)` below,
// and individual-schema direct-parse gets the refinement via the public `<X>FieldSchema` export.
import { MatInputFieldSchemaObject } from './fields/mat-input-field.schema';
import { MatTextareaFieldSchemaObject } from './fields/mat-textarea-field.schema';
import { MatSelectFieldSchemaObject } from './fields/mat-select-field.schema';
import { MatCheckboxFieldSchema } from './fields/mat-checkbox-field.schema';
import { MatRadioFieldSchemaObject } from './fields/mat-radio-field.schema';
import { MatMultiCheckboxFieldSchemaObject } from './fields/mat-multi-checkbox-field.schema';
import { MatToggleFieldSchema } from './fields/mat-toggle-field.schema';
import { MatSliderFieldSchemaObject } from './fields/mat-slider-field.schema';
import { MatDatepickerFieldSchemaObject } from './fields/mat-datepicker-field.schema';
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
  'addArrayItem',
  'removeArrayItem',
] as const;

export type MatLeafFieldType = (typeof MatLeafFieldTypes)[number];
