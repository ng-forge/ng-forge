import { z } from 'zod';
import { TextFieldSchema, HiddenFieldSchema } from '../../src/lib/schemas/leaves';
import { nullableValueRefine } from '../../src/lib/schemas/field/nullable-value.refinement';
import {
  BsInputFieldSchema,
  BsTextareaFieldSchema,
  BsSelectFieldSchema,
  BsCheckboxFieldSchema,
  BsRadioFieldSchema,
  BsMultiCheckboxFieldSchema,
  BsToggleFieldSchema,
  BsDatepickerFieldSchema,
  BsSliderFieldSchema,
  BsButtonFieldSchema,
  BsSubmitButtonFieldSchema,
  BsNextButtonFieldSchema,
  BsPreviousButtonFieldSchema,
  BsAddArrayItemButtonFieldSchema,
  BsRemoveArrayItemButtonFieldSchema,
} from './fields';

/**
 * Discriminated union of all Bootstrap leaf field types.
 */
export const BsLeafFieldSchema = z
  .discriminatedUnion('type', [
    TextFieldSchema,
    HiddenFieldSchema,
    BsInputFieldSchema,
    BsTextareaFieldSchema,
    BsSelectFieldSchema,
    BsCheckboxFieldSchema,
    BsRadioFieldSchema,
    BsMultiCheckboxFieldSchema,
    BsToggleFieldSchema,
    BsDatepickerFieldSchema,
    BsSliderFieldSchema,
    BsButtonFieldSchema,
    BsSubmitButtonFieldSchema,
    BsNextButtonFieldSchema,
    BsPreviousButtonFieldSchema,
    BsAddArrayItemButtonFieldSchema,
    BsRemoveArrayItemButtonFieldSchema,
  ])
  .superRefine(nullableValueRefine);

export type BsLeafFieldSchemaType = z.infer<typeof BsLeafFieldSchema>;
