import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { FieldOptionsSchema } from '../../../src/lib/schemas/common/field-option.schema';
import { LogicArraySchema } from '../../../src/lib/schemas/logic/logic-config.schema';
import {
  PrimeInputPropsSchema,
  PrimeCheckboxPropsSchema,
  PrimeRadioPropsSchema,
  PrimeSelectPropsSchema,
  PrimeMultiCheckboxPropsSchema,
  PrimeDatepickerPropsSchema,
  PrimeTextareaPropsSchema,
  PrimeSliderPropsSchema,
  PrimeTogglePropsSchema,
  PrimeButtonPropsSchema,
} from '../props';

const PrimeValueFieldBase = BaseFieldDefSchema.merge(FieldWithValidationSchema);

// Input field
export const PrimeInputFieldSchema = PrimeValueFieldBase.extend({
  type: z.literal('input'),
  value: z.string().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: PrimeInputPropsSchema.optional(),
});

// Checkbox field
export const PrimeCheckboxFieldSchema = PrimeValueFieldBase.extend({
  type: z.literal('checkbox'),
  value: z.boolean().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: PrimeCheckboxPropsSchema.optional(),
});

// Radio field
export const PrimeRadioFieldSchema = PrimeValueFieldBase.extend({
  type: z.literal('radio'),
  value: z.unknown().optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: PrimeRadioPropsSchema.optional(),
});

// Select field
export const PrimeSelectFieldSchema = PrimeValueFieldBase.extend({
  type: z.literal('select'),
  value: z.unknown().optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: PrimeSelectPropsSchema.optional(),
});

// Multi-checkbox field
export const PrimeMultiCheckboxFieldSchema = PrimeValueFieldBase.extend({
  type: z.literal('multi-checkbox'),
  value: z.array(z.unknown()).optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: PrimeMultiCheckboxPropsSchema.optional(),
});

// Datepicker field
export const PrimeDatepickerFieldSchema = PrimeValueFieldBase.extend({
  type: z.literal('datepicker'),
  value: z.union([z.string(), z.null()]).optional(),
  minDate: z.union([z.string(), z.null()]).optional(),
  maxDate: z.union([z.string(), z.null()]).optional(),
  startAt: z.union([z.string(), z.null()]).optional(),
  placeholder: DynamicTextSchema.optional(),
  props: PrimeDatepickerPropsSchema.optional(),
});

// Textarea field
export const PrimeTextareaFieldSchema = PrimeValueFieldBase.extend({
  type: z.literal('textarea'),
  value: z.string().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: PrimeTextareaPropsSchema.optional(),
});

// Slider field
export const PrimeSliderFieldSchema = PrimeValueFieldBase.extend({
  type: z.literal('slider'),
  value: z.number().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  step: z.number().positive().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: PrimeSliderPropsSchema.optional(),
});

// Toggle field
export const PrimeToggleFieldSchema = PrimeValueFieldBase.extend({
  type: z.literal('toggle'),
  value: z.boolean().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: PrimeTogglePropsSchema.optional(),
});

// Button fields
export const PrimeButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('button'),
  event: z.string().optional(),
  eventArgs: z.array(z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()])).optional(),
  props: PrimeButtonPropsSchema.optional(),
  logic: LogicArraySchema.optional(),
});

export const PrimeSubmitButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('submit'),
  props: PrimeButtonPropsSchema.optional(),
  logic: LogicArraySchema.optional(),
});

export const PrimeNextButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('next'),
  props: PrimeButtonPropsSchema.optional(),
  logic: LogicArraySchema.optional(),
});

export const PrimePreviousButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('previous'),
  props: PrimeButtonPropsSchema.optional(),
});

export const PrimeAddArrayItemButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('addArrayItem'),
  arrayKey: z.string().optional(),
  props: PrimeButtonPropsSchema.optional(),
});

export const PrimeRemoveArrayItemButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('removeArrayItem'),
  arrayKey: z.string().optional(),
  props: PrimeButtonPropsSchema.optional(),
});
