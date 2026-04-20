import { z } from 'zod';
import { TextFieldSchema, HiddenFieldSchema } from '../../src/lib/schemas/leaves';
import { nullableValueRefine } from '../../src/lib/schemas/field/nullable-value.refinement';
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
export const IonicLeafFieldSchema = z
  .discriminatedUnion('type', [
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
  ])
  .superRefine(nullableValueRefine);

export type IonicLeafFieldSchemaType = z.infer<typeof IonicLeafFieldSchema>;
