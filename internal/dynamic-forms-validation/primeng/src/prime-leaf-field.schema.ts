import { z } from 'zod';
import { TextFieldSchema, HiddenFieldSchema } from '../../src/lib/schemas/leaves/index';
import { nullableValueRefine } from '../../src/lib/schemas/field/nullable-value.refinement';
import {
  PrimeInputFieldSchemaObject,
  PrimeCheckboxFieldSchema,
  PrimeRadioFieldSchemaObject,
  PrimeSelectFieldSchemaObject,
  PrimeMultiCheckboxFieldSchemaObject,
  PrimeDatepickerFieldSchemaObject,
  PrimeTextareaFieldSchemaObject,
  PrimeSliderFieldSchemaObject,
  PrimeToggleFieldSchema,
  PrimeButtonFieldSchema,
  PrimeSubmitButtonFieldSchema,
  PrimeNextButtonFieldSchema,
  PrimePreviousButtonFieldSchema,
  PrimeAddArrayItemButtonFieldSchema,
  PrimeRemoveArrayItemButtonFieldSchema,
  PrimePrependArrayItemButtonFieldSchema,
  PrimeInsertArrayItemButtonFieldSchema,
  PrimePopArrayItemButtonFieldSchema,
  PrimeShiftArrayItemButtonFieldSchema,
} from './fields/index';

/**
 * Discriminated union of all PrimeNG leaf field types.
 */
export const PrimeLeafFieldSchema = z
  .discriminatedUnion('type', [
    TextFieldSchema,
    HiddenFieldSchema,
    PrimeInputFieldSchemaObject,
    PrimeCheckboxFieldSchema,
    PrimeRadioFieldSchemaObject,
    PrimeSelectFieldSchemaObject,
    PrimeMultiCheckboxFieldSchemaObject,
    PrimeDatepickerFieldSchemaObject,
    PrimeTextareaFieldSchemaObject,
    PrimeSliderFieldSchemaObject,
    PrimeToggleFieldSchema,
    PrimeButtonFieldSchema,
    PrimeSubmitButtonFieldSchema,
    PrimeNextButtonFieldSchema,
    PrimePreviousButtonFieldSchema,
    PrimeAddArrayItemButtonFieldSchema,
    PrimeRemoveArrayItemButtonFieldSchema,
    PrimePrependArrayItemButtonFieldSchema,
    PrimeInsertArrayItemButtonFieldSchema,
    PrimePopArrayItemButtonFieldSchema,
    PrimeShiftArrayItemButtonFieldSchema,
  ])
  .superRefine(nullableValueRefine);

export type PrimeLeafFieldSchemaType = z.infer<typeof PrimeLeafFieldSchema>;
