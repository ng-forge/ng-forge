import { z } from 'zod';
import { TextFieldSchema, HiddenFieldSchema } from '../../src/lib/schemas/leaves';
import {
  IonicInputFieldSchema,
  IonicCheckboxFieldSchema,
  IonicRadioFieldSchema,
  IonicToggleFieldSchema,
  IonicSliderFieldSchema,
  IonicDatepickerFieldSchema,
  IonicSelectFieldSchema,
  IonicTextareaFieldSchema,
  IonicMultiCheckboxFieldSchema,
  IonicButtonFieldSchema,
  IonicSubmitButtonFieldSchema,
  IonicNextButtonFieldSchema,
  IonicPreviousButtonFieldSchema,
  IonicAddArrayItemButtonFieldSchema,
  IonicRemoveArrayItemButtonFieldSchema,
} from './fields';

/**
 * Discriminated union of all Ionic leaf field types.
 */
export const IonicLeafFieldSchema = z.discriminatedUnion('type', [
  TextFieldSchema,
  HiddenFieldSchema,
  IonicInputFieldSchema,
  IonicCheckboxFieldSchema,
  IonicRadioFieldSchema,
  IonicToggleFieldSchema,
  IonicSliderFieldSchema,
  IonicDatepickerFieldSchema,
  IonicSelectFieldSchema,
  IonicTextareaFieldSchema,
  IonicMultiCheckboxFieldSchema,
  IonicButtonFieldSchema,
  IonicSubmitButtonFieldSchema,
  IonicNextButtonFieldSchema,
  IonicPreviousButtonFieldSchema,
  IonicAddArrayItemButtonFieldSchema,
  IonicRemoveArrayItemButtonFieldSchema,
]);

export type IonicLeafFieldSchemaType = z.infer<typeof IonicLeafFieldSchema>;
