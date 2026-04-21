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
import { nullableValueRefine } from '../../../src/lib/schemas/field/nullable-value.refinement';

const IonicValueFieldBase = BaseFieldDefSchema.merge(FieldWithValidationSchema);

// Input field
/*
 * For each value-bearing field schema below we follow a dual-export pattern:
 *
 *   const Xxx...FieldSchemaObject = base.extend({ ... });   // raw ZodObject
 *   export const Xxx...FieldSchema =
 *     Xxx...FieldSchemaObject.superRefine(nullableValueRefine);   // public, refined
 *
 * The raw object is required because z.discriminatedUnion in the leaf schema
 * rejects ZodEffects; the refined version enforces the cross-field contract
 * (`value: null` requires `nullable: true`) on direct parse. The union applies
 * `.superRefine(nullableValueRefine)` at its top level too, so the refinement
 * runs for full-config validation regardless of which entry point is used.
 */

const IonicInputFieldSchemaObject = IonicValueFieldBase.extend({
  type: z.literal('input'),
  nullable: z.boolean().optional(),
  value: z.string().nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: IonicInputPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`IonicInputFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const IonicInputFieldSchema = IonicInputFieldSchemaObject.superRefine(nullableValueRefine);
export { IonicInputFieldSchemaObject };

// Checkbox field
export const IonicCheckboxFieldSchema = IonicValueFieldBase.extend({
  type: z.literal('checkbox'),
  value: z.boolean().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: IonicCheckboxPropsSchema.optional(),
});

// Radio field
const IonicRadioFieldSchemaObject = IonicValueFieldBase.extend({
  type: z.literal('radio'),
  nullable: z.boolean().optional(),
  value: z.unknown().nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: IonicRadioPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`IonicRadioFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const IonicRadioFieldSchema = IonicRadioFieldSchemaObject.superRefine(nullableValueRefine);
export { IonicRadioFieldSchemaObject };

// Toggle field
export const IonicToggleFieldSchema = IonicValueFieldBase.extend({
  type: z.literal('toggle'),
  value: z.boolean().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: IonicTogglePropsSchema.optional(),
});

// Slider field
const IonicSliderFieldSchemaObject = IonicValueFieldBase.extend({
  type: z.literal('slider'),
  nullable: z.boolean().optional(),
  value: z.number().nullable().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  step: z.number().positive().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: IonicSliderPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`IonicSliderFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const IonicSliderFieldSchema = IonicSliderFieldSchemaObject.superRefine(nullableValueRefine);
export { IonicSliderFieldSchemaObject };

// Datepicker field
const IonicDatepickerFieldSchemaObject = IonicValueFieldBase.extend({
  type: z.literal('datepicker'),
  nullable: z.boolean().optional(),
  value: z.union([z.string(), z.null()]).optional(),
  minDate: z.union([z.string(), z.null()]).optional(),
  maxDate: z.union([z.string(), z.null()]).optional(),
  startAt: z.union([z.string(), z.null()]).optional(),
  placeholder: DynamicTextSchema.optional(),
  props: IonicDatepickerPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`IonicDatepickerFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const IonicDatepickerFieldSchema = IonicDatepickerFieldSchemaObject.superRefine(nullableValueRefine);
export { IonicDatepickerFieldSchemaObject };

// Select field
const IonicSelectFieldSchemaObject = IonicValueFieldBase.extend({
  type: z.literal('select'),
  nullable: z.boolean().optional(),
  value: z.unknown().nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: IonicSelectPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`IonicSelectFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const IonicSelectFieldSchema = IonicSelectFieldSchemaObject.superRefine(nullableValueRefine);
export { IonicSelectFieldSchemaObject };

// Textarea field
const IonicTextareaFieldSchemaObject = IonicValueFieldBase.extend({
  type: z.literal('textarea'),
  nullable: z.boolean().optional(),
  value: z.string().nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: IonicTextareaPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`IonicTextareaFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const IonicTextareaFieldSchema = IonicTextareaFieldSchemaObject.superRefine(nullableValueRefine);
export { IonicTextareaFieldSchemaObject };

// Multi-checkbox field
const IonicMultiCheckboxFieldSchemaObject = IonicValueFieldBase.extend({
  type: z.literal('multi-checkbox'),
  nullable: z.boolean().optional(),
  value: z.array(z.unknown()).nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: IonicMultiCheckboxPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`IonicMultiCheckboxFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const IonicMultiCheckboxFieldSchema = IonicMultiCheckboxFieldSchemaObject.superRefine(nullableValueRefine);
export { IonicMultiCheckboxFieldSchemaObject };

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
