import { z } from 'zod';
import { TextFieldSchema, HiddenFieldSchema } from '../../src/lib/schemas/leaves';
import { nullableValueRefine } from '../../src/lib/schemas/field/nullable-value.refinement';
import {
  IonicInputFieldSchemaObject,
  IonicCheckboxFieldSchema,
  IonicRadioFieldSchemaObject,
  IonicToggleFieldSchema,
  IonicSliderFieldSchemaObject,
  IonicDatepickerFieldSchemaObject,
  IonicSelectFieldSchemaObject,
  IonicTextareaFieldSchemaObject,
  IonicMultiCheckboxFieldSchemaObject,
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
    IonicInputFieldSchemaObject,
    IonicCheckboxFieldSchema,
    IonicRadioFieldSchemaObject,
    IonicToggleFieldSchema,
    IonicSliderFieldSchemaObject,
    IonicDatepickerFieldSchemaObject,
    IonicSelectFieldSchemaObject,
    IonicTextareaFieldSchemaObject,
    IonicMultiCheckboxFieldSchemaObject,
    IonicButtonFieldSchema,
    IonicSubmitButtonFieldSchema,
    IonicNextButtonFieldSchema,
    IonicPreviousButtonFieldSchema,
    IonicAddArrayItemButtonFieldSchema,
    IonicRemoveArrayItemButtonFieldSchema,
  ])
  .superRefine(nullableValueRefine);

export type IonicLeafFieldSchemaType = z.infer<typeof IonicLeafFieldSchema>;
