import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';
import { BsSizeSchema, BsFormFieldPropsSchema, BsButtonVariantSchema } from './bs-common-props.schema';

export * from './bs-common-props.schema';

// Input props
export const BsInputPropsSchema = BsFormFieldPropsSchema.extend({
  type: z.enum(['text', 'email', 'password', 'number', 'tel', 'url']).optional(),
  placeholder: DynamicTextSchema.optional(),
  plaintext: z.boolean().optional(),
});

// Textarea props
export const BsTextareaPropsSchema = BsFormFieldPropsSchema.extend({
  rows: z.number().positive().optional(),
  placeholder: DynamicTextSchema.optional(),
});

// Select props
export const BsSelectPropsSchema = BsFormFieldPropsSchema.extend({
  multiple: z.boolean().optional(),
  htmlSize: z.number().positive().optional(),
  placeholder: DynamicTextSchema.optional(),
});

// Checkbox props
export const BsCheckboxPropsSchema = z.object({
  switch: z.boolean().optional(),
  inline: z.boolean().optional(),
  reverse: z.boolean().optional(),
  indeterminate: z.boolean().optional(),
  hint: DynamicTextSchema.optional(),
});

// Radio props
export const BsRadioPropsSchema = z.object({
  inline: z.boolean().optional(),
  reverse: z.boolean().optional(),
  buttonGroup: z.boolean().optional(),
  buttonSize: BsSizeSchema.optional(),
  hint: DynamicTextSchema.optional(),
});

// Multi-checkbox props
export const BsMultiCheckboxPropsSchema = z.object({
  switch: z.boolean().optional(),
  inline: z.boolean().optional(),
  reverse: z.boolean().optional(),
  hint: DynamicTextSchema.optional(),
});

// Toggle props
export const BsTogglePropsSchema = z.object({
  size: BsSizeSchema.optional(),
  reverse: z.boolean().optional(),
  inline: z.boolean().optional(),
  hint: DynamicTextSchema.optional(),
});

// Datepicker props
export const BsDatepickerPropsSchema = BsFormFieldPropsSchema.extend({
  useNgBootstrap: z.boolean().optional(),
  displayMonths: z.number().positive().optional(),
  navigation: z.enum(['select', 'arrows', 'none']).optional(),
  outsideDays: z.enum(['visible', 'collapsed', 'hidden']).optional(),
  showWeekNumbers: z.boolean().optional(),
  placeholder: DynamicTextSchema.optional(),
});

// Slider props
export const BsSliderPropsSchema = z.object({
  showValue: z.boolean().optional(),
  valuePrefix: z.string().optional(),
  valueSuffix: z.string().optional(),
  hint: DynamicTextSchema.optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
});

// Button props
export const BsButtonPropsSchema = z.object({
  variant: BsButtonVariantSchema.optional(),
  outline: z.boolean().optional(),
  size: BsSizeSchema.optional(),
  block: z.boolean().optional(),
  active: z.boolean().optional(),
  type: z.enum(['button', 'submit', 'reset']).optional(),
});
