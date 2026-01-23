import { z } from 'zod';
import { TextFieldSchema, HiddenFieldSchema } from '../../src/lib/schemas/leaves';
import {
  PrimeInputFieldSchema,
  PrimeCheckboxFieldSchema,
  PrimeRadioFieldSchema,
  PrimeSelectFieldSchema,
  PrimeMultiCheckboxFieldSchema,
  PrimeDatepickerFieldSchema,
  PrimeTextareaFieldSchema,
  PrimeSliderFieldSchema,
  PrimeToggleFieldSchema,
  PrimeButtonFieldSchema,
  PrimeSubmitButtonFieldSchema,
  PrimeNextButtonFieldSchema,
  PrimePreviousButtonFieldSchema,
  PrimeAddArrayItemButtonFieldSchema,
  PrimeRemoveArrayItemButtonFieldSchema,
} from './fields';

/**
 * Discriminated union of all PrimeNG leaf field types.
 */
export const PrimeLeafFieldSchema = z.discriminatedUnion('type', [
  TextFieldSchema,
  HiddenFieldSchema,
  PrimeInputFieldSchema,
  PrimeCheckboxFieldSchema,
  PrimeRadioFieldSchema,
  PrimeSelectFieldSchema,
  PrimeMultiCheckboxFieldSchema,
  PrimeDatepickerFieldSchema,
  PrimeTextareaFieldSchema,
  PrimeSliderFieldSchema,
  PrimeToggleFieldSchema,
  PrimeButtonFieldSchema,
  PrimeSubmitButtonFieldSchema,
  PrimeNextButtonFieldSchema,
  PrimePreviousButtonFieldSchema,
  PrimeAddArrayItemButtonFieldSchema,
  PrimeRemoveArrayItemButtonFieldSchema,
]);

export type PrimeLeafFieldSchemaType = z.infer<typeof PrimeLeafFieldSchema>;
