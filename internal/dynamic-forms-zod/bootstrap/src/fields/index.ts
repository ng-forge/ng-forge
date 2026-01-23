import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { FieldWithValidationSchema } from '../../../src/lib/schemas/field/field-with-validation.schema';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { FieldOptionsSchema } from '../../../src/lib/schemas/common/field-option.schema';
import { LogicArraySchema } from '../../../src/lib/schemas/logic/logic-config.schema';
import {
  BsInputPropsSchema,
  BsTextareaPropsSchema,
  BsSelectPropsSchema,
  BsCheckboxPropsSchema,
  BsRadioPropsSchema,
  BsMultiCheckboxPropsSchema,
  BsTogglePropsSchema,
  BsDatepickerPropsSchema,
  BsSliderPropsSchema,
  BsButtonPropsSchema,
} from '../props';

// Value field base (extends BaseFieldDef with validation)
const BsValueFieldBase = BaseFieldDefSchema.merge(FieldWithValidationSchema);

// Input field
export const BsInputFieldSchema = BsValueFieldBase.extend({
  type: z.literal('input'),
  value: z.string().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: BsInputPropsSchema.optional(),
});

// Textarea field
export const BsTextareaFieldSchema = BsValueFieldBase.extend({
  type: z.literal('textarea'),
  value: z.string().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: BsTextareaPropsSchema.optional(),
});

// Select field
export const BsSelectFieldSchema = BsValueFieldBase.extend({
  type: z.literal('select'),
  value: z.string().optional(), // Bootstrap select only supports strings
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: BsSelectPropsSchema.optional(),
});

// Checkbox field
export const BsCheckboxFieldSchema = BsValueFieldBase.extend({
  type: z.literal('checkbox'),
  value: z.boolean().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: BsCheckboxPropsSchema.optional(),
});

// Radio field
export const BsRadioFieldSchema = BsValueFieldBase.extend({
  type: z.literal('radio'),
  value: z.unknown().optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: BsRadioPropsSchema.optional(),
});

// Multi-checkbox field
export const BsMultiCheckboxFieldSchema = BsValueFieldBase.extend({
  type: z.literal('multi-checkbox'),
  value: z.array(z.unknown()).optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: BsMultiCheckboxPropsSchema.optional(),
});

// Toggle field
export const BsToggleFieldSchema = BsValueFieldBase.extend({
  type: z.literal('toggle'),
  value: z.boolean().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: BsTogglePropsSchema.optional(),
});

// Datepicker field
export const BsDatepickerFieldSchema = BsValueFieldBase.extend({
  type: z.literal('datepicker'),
  value: z.union([z.string(), z.null()]).optional(),
  minDate: z.union([z.string(), z.null()]).optional(),
  maxDate: z.union([z.string(), z.null()]).optional(),
  startAt: z.union([z.string(), z.null()]).optional(),
  placeholder: DynamicTextSchema.optional(),
  props: BsDatepickerPropsSchema.optional(),
});

// Slider field
export const BsSliderFieldSchema = BsValueFieldBase.extend({
  type: z.literal('slider'),
  value: z.number().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  step: z.number().positive().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: BsSliderPropsSchema.optional(),
});

// Button fields
export const BsButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('button'),
  event: z.string().optional(),
  eventArgs: z.array(z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()])).optional(),
  props: BsButtonPropsSchema.optional(),
  logic: LogicArraySchema.optional(),
});

export const BsSubmitButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('submit'),
  props: BsButtonPropsSchema.optional(),
  logic: LogicArraySchema.optional(),
});

export const BsNextButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('next'),
  props: BsButtonPropsSchema.optional(),
  logic: LogicArraySchema.optional(),
});

export const BsPreviousButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('previous'),
  props: BsButtonPropsSchema.optional(),
});

export const BsAddArrayItemButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('addArrayItem'),
  arrayKey: z.string().optional(),
  props: BsButtonPropsSchema.optional(),
});

export const BsRemoveArrayItemButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('removeArrayItem'),
  arrayKey: z.string().optional(),
  props: BsButtonPropsSchema.optional(),
});

// Export types
export type BsInputFieldSchemaType = z.infer<typeof BsInputFieldSchema>;
export type BsTextareaFieldSchemaType = z.infer<typeof BsTextareaFieldSchema>;
export type BsSelectFieldSchemaType = z.infer<typeof BsSelectFieldSchema>;
export type BsCheckboxFieldSchemaType = z.infer<typeof BsCheckboxFieldSchema>;
export type BsRadioFieldSchemaType = z.infer<typeof BsRadioFieldSchema>;
export type BsMultiCheckboxFieldSchemaType = z.infer<typeof BsMultiCheckboxFieldSchema>;
export type BsToggleFieldSchemaType = z.infer<typeof BsToggleFieldSchema>;
export type BsDatepickerFieldSchemaType = z.infer<typeof BsDatepickerFieldSchema>;
export type BsSliderFieldSchemaType = z.infer<typeof BsSliderFieldSchema>;
export type BsButtonFieldSchemaType = z.infer<typeof BsButtonFieldSchema>;
