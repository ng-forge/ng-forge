import { z } from 'zod';
import { DynamicTextSchema } from '../../../src/lib/schemas/common/dynamic-text.schema';

/**
 * Ionic color palette.
 */
export const IonicColorSchema = z.enum(['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'light', 'medium', 'dark']);

/**
 * Ionic label placement options.
 */
export const IonicLabelPlacementSchema = z.enum(['start', 'end', 'fixed', 'stacked', 'floating']);

/**
 * Ionic justify options.
 */
export const IonicJustifySchema = z.enum(['start', 'end', 'space-between']);

/**
 * Ionic fill variants.
 */
export const IonicFillSchema = z.enum(['solid', 'outline', 'clear', 'default']);

// Input props
export const IonicInputPropsSchema = z.object({
  fill: z.enum(['solid', 'outline']).optional(),
  shape: z.literal('round').optional(),
  labelPlacement: IonicLabelPlacementSchema.optional(),
  color: IonicColorSchema.optional(),
  hint: DynamicTextSchema.optional(),
  errorText: DynamicTextSchema.optional(),
  counter: z.boolean().optional(),
  maxlength: z.number().positive().optional(),
  clearInput: z.boolean().optional(),
  type: z.enum(['text', 'email', 'password', 'number', 'tel', 'url']).optional(),
  placeholder: DynamicTextSchema.optional(),
});

// Checkbox props
export const IonicCheckboxPropsSchema = z.object({
  labelPlacement: z.enum(['start', 'end', 'fixed', 'stacked']).optional(),
  justify: IonicJustifySchema.optional(),
  color: z.enum(['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger']).optional(),
  indeterminate: z.boolean().optional(),
  hint: DynamicTextSchema.optional(),
});

// Radio props
export const IonicRadioPropsSchema = z.object({
  labelPlacement: z.enum(['start', 'end', 'fixed', 'stacked']).optional(),
  justify: IonicJustifySchema.optional(),
  color: z.enum(['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger']).optional(),
  hint: DynamicTextSchema.optional(),
});

// Toggle props
export const IonicTogglePropsSchema = z.object({
  labelPlacement: z.enum(['start', 'end', 'fixed', 'stacked']).optional(),
  justify: IonicJustifySchema.optional(),
  color: z.enum(['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger']).optional(),
  enableOnOffLabels: z.boolean().optional(),
  hint: DynamicTextSchema.optional(),
});

// Slider props
export const IonicSliderPropsSchema = z.object({
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().positive().optional(),
  dualKnobs: z.boolean().optional(),
  pin: z.boolean().optional(),
  ticks: z.boolean().optional(),
  snaps: z.boolean().optional(),
  color: z.enum(['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger']).optional(),
  labelPlacement: z.enum(['start', 'end', 'fixed', 'stacked']).optional(),
  hint: DynamicTextSchema.optional(),
});

// Datepicker props
export const IonicDatepickerPropsSchema = z.object({
  presentation: z.enum(['date', 'date-time', 'time', 'time-date', 'month', 'month-year', 'year']).optional(),
  multiple: z.boolean().optional(),
  preferWheel: z.boolean().optional(),
  showDefaultButtons: z.boolean().optional(),
  showDefaultTitle: z.boolean().optional(),
  showDefaultTimeLabel: z.boolean().optional(),
  showClearButton: z.boolean().optional(),
  doneText: z.string().optional(),
  cancelText: z.string().optional(),
  size: z.enum(['cover', 'fixed']).optional(),
  color: z.enum(['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger']).optional(),
  hint: DynamicTextSchema.optional(),
  placeholder: DynamicTextSchema.optional(),
});

// Select props
export const IonicSelectPropsSchema = z.object({
  multiple: z.boolean().optional(),
  interface: z.enum(['action-sheet', 'popover', 'alert']).optional(),
  cancelText: z.string().optional(),
  okText: z.string().optional(),
  placeholder: DynamicTextSchema.optional(),
  fill: z.enum(['solid', 'outline']).optional(),
  shape: z.literal('round').optional(),
  labelPlacement: IonicLabelPlacementSchema.optional(),
  color: z.enum(['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger']).optional(),
  hint: DynamicTextSchema.optional(),
});

// Textarea props
export const IonicTextareaPropsSchema = z.object({
  rows: z.number().positive().optional(),
  autoGrow: z.boolean().optional(),
  maxlength: z.number().positive().optional(),
  counter: z.boolean().optional(),
  fill: z.enum(['solid', 'outline']).optional(),
  shape: z.literal('round').optional(),
  labelPlacement: IonicLabelPlacementSchema.optional(),
  hint: DynamicTextSchema.optional(),
  errorText: DynamicTextSchema.optional(),
  color: IonicColorSchema.optional(),
  placeholder: DynamicTextSchema.optional(),
});

// Multi-checkbox props
export const IonicMultiCheckboxPropsSchema = z.object({
  labelPlacement: z.enum(['start', 'end', 'fixed', 'stacked']).optional(),
  justify: IonicJustifySchema.optional(),
  color: z.enum(['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger']).optional(),
  hint: DynamicTextSchema.optional(),
});

// Button props
export const IonicButtonPropsSchema = z.object({
  expand: z.enum(['full', 'block']).optional(),
  fill: IonicFillSchema.optional(),
  shape: z.literal('round').optional(),
  size: z.enum(['small', 'default', 'large']).optional(),
  color: IonicColorSchema.optional(),
  strong: z.boolean().optional(),
  type: z.enum(['button', 'submit', 'reset']).optional(),
});
