import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';

/**
 * PrimeNG severity levels.
 */
export const PrimeSeveritySchema = z.enum(['primary', 'secondary', 'success', 'info', 'warn', 'danger', 'help', 'contrast']);

/**
 * Common PrimeNG props.
 */
export const PrimeCommonPropsSchema = z.object({
  styleClass: z.string().optional(),
  hint: DynamicTextSchema.optional(),
});

// Input props
export const PrimeInputPropsSchema = PrimeCommonPropsSchema.extend({
  type: z.enum(['text', 'email', 'password', 'number', 'tel', 'url']).optional(),
  placeholder: DynamicTextSchema.optional(),
  size: z.enum(['small', 'large']).optional(),
  variant: z.enum(['outlined', 'filled']).optional(),
});

// Checkbox props
export const PrimeCheckboxPropsSchema = PrimeCommonPropsSchema.extend({
  binary: z.boolean().optional(),
  trueValue: z.unknown().optional(),
  falseValue: z.unknown().optional(),
});

// Radio props
export const PrimeRadioPropsSchema = PrimeCommonPropsSchema.extend({
  name: z.string().optional(),
});

// Select props
export const PrimeSelectPropsSchema = PrimeCommonPropsSchema.extend({
  multiple: z.boolean().optional(),
  filter: z.boolean().optional(),
  placeholder: DynamicTextSchema.optional(),
  showClear: z.boolean().optional(),
});

// Multi-checkbox props
export const PrimeMultiCheckboxPropsSchema = PrimeCommonPropsSchema;

// Datepicker props
export const PrimeDatepickerPropsSchema = PrimeCommonPropsSchema.extend({
  dateFormat: z.string().optional(),
  inline: z.boolean().optional(),
  showIcon: z.boolean().optional(),
  showButtonBar: z.boolean().optional(),
  selectionMode: z.enum(['single', 'multiple', 'range']).optional(),
  touchUI: z.boolean().optional(),
  view: z.enum(['date', 'month', 'year']).optional(),
  placeholder: DynamicTextSchema.optional(),
});

// Textarea props
export const PrimeTextareaPropsSchema = PrimeCommonPropsSchema.extend({
  rows: z.number().positive().optional(),
  autoResize: z.boolean().optional(),
  maxlength: z.number().positive().optional(),
  placeholder: DynamicTextSchema.optional(),
});

// Slider props
export const PrimeSliderPropsSchema = PrimeCommonPropsSchema.extend({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
  range: z.boolean().optional(),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
});

// Toggle props
export const PrimeTogglePropsSchema = PrimeCommonPropsSchema;

// Button props
export const PrimeButtonPropsSchema = z.object({
  severity: PrimeSeveritySchema.optional(),
  text: z.boolean().optional(),
  outlined: z.boolean().optional(),
  raised: z.boolean().optional(),
  rounded: z.boolean().optional(),
  icon: z.string().optional(),
  iconPos: z.enum(['left', 'right', 'top', 'bottom']).optional(),
  type: z.enum(['button', 'submit', 'reset']).optional(),
});
