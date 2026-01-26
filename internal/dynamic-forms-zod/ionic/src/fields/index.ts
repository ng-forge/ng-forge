import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { FieldOptionsSchema } from '../../../src/lib/schemas/common/field-option.schema';
import { LogicArraySchema } from '../../../src/lib/schemas/logic/logic-config.schema';
import {
  IonicInputPropsSchema,
  IonicCheckboxPropsSchema,
  IonicRadioPropsSchema,
  IonicTogglePropsSchema,
  IonicSliderPropsSchema,
  IonicDatepickerPropsSchema,
  IonicSelectPropsSchema,
  IonicTextareaPropsSchema,
  IonicMultiCheckboxPropsSchema,
  IonicButtonPropsSchema,
} from '../props';

const IonicValueFieldBase = BaseFieldDefSchema.merge(FieldWithValidationSchema);

// Input field
export const IonicInputFieldSchema = IonicValueFieldBase.extend({
  type: z.literal('input'),
  value: z.string().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: IonicInputPropsSchema.optional(),
});

// Checkbox field
export const IonicCheckboxFieldSchema = IonicValueFieldBase.extend({
  type: z.literal('checkbox'),
  value: z.boolean().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: IonicCheckboxPropsSchema.optional(),
});

// Radio field
export const IonicRadioFieldSchema = IonicValueFieldBase.extend({
  type: z.literal('radio'),
  value: z.unknown().optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: IonicRadioPropsSchema.optional(),
});

// Toggle field
export const IonicToggleFieldSchema = IonicValueFieldBase.extend({
  type: z.literal('toggle'),
  value: z.boolean().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: IonicTogglePropsSchema.optional(),
});

// Slider field
export const IonicSliderFieldSchema = IonicValueFieldBase.extend({
  type: z.literal('slider'),
  value: z.number().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  step: z.number().positive().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: IonicSliderPropsSchema.optional(),
});

// Datepicker field
export const IonicDatepickerFieldSchema = IonicValueFieldBase.extend({
  type: z.literal('datepicker'),
  value: z.union([z.string(), z.null()]).optional(),
  minDate: z.union([z.string(), z.null()]).optional(),
  maxDate: z.union([z.string(), z.null()]).optional(),
  startAt: z.union([z.string(), z.null()]).optional(),
  placeholder: DynamicTextSchema.optional(),
  props: IonicDatepickerPropsSchema.optional(),
});

// Select field
export const IonicSelectFieldSchema = IonicValueFieldBase.extend({
  type: z.literal('select'),
  value: z.unknown().optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: IonicSelectPropsSchema.optional(),
});

// Textarea field
export const IonicTextareaFieldSchema = IonicValueFieldBase.extend({
  type: z.literal('textarea'),
  value: z.string().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: IonicTextareaPropsSchema.optional(),
});

// Multi-checkbox field
export const IonicMultiCheckboxFieldSchema = IonicValueFieldBase.extend({
  type: z.literal('multi-checkbox'),
  value: z.array(z.unknown()).optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: IonicMultiCheckboxPropsSchema.optional(),
});

// Button fields
export const IonicButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('button'),
  event: z.string().optional(),
  eventArgs: z.array(z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()])).optional(),
  props: IonicButtonPropsSchema.optional(),
  logic: LogicArraySchema.optional(),
});

export const IonicSubmitButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('submit'),
  props: IonicButtonPropsSchema.optional(),
  logic: LogicArraySchema.optional(),
});

export const IonicNextButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('next'),
  props: IonicButtonPropsSchema.optional(),
  logic: LogicArraySchema.optional(),
});

export const IonicPreviousButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('previous'),
  props: IonicButtonPropsSchema.optional(),
});

export const IonicAddArrayItemButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('addArrayItem'),
  arrayKey: z.string().optional(),
  props: IonicButtonPropsSchema.optional(),
});

export const IonicRemoveArrayItemButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('removeArrayItem'),
  arrayKey: z.string().optional(),
  props: IonicButtonPropsSchema.optional(),
});
