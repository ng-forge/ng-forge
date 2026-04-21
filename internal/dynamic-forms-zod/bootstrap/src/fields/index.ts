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
import { nullableValueRefine } from '../../../src/lib/schemas/field/nullable-value.refinement';

// Value field base (extends BaseFieldDef with validation)
const BsValueFieldBase = BaseFieldDefSchema.merge(FieldWithValidationSchema);

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

const BsInputFieldSchemaObject = BsValueFieldBase.extend({
  type: z.literal('input'),
  nullable: z.boolean().optional(),
  value: z.string().nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: BsInputPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`BsInputFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const BsInputFieldSchema = BsInputFieldSchemaObject.superRefine(nullableValueRefine);
export { BsInputFieldSchemaObject };

// Textarea field
const BsTextareaFieldSchemaObject = BsValueFieldBase.extend({
  type: z.literal('textarea'),
  nullable: z.boolean().optional(),
  value: z.string().nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: BsTextareaPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`BsTextareaFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const BsTextareaFieldSchema = BsTextareaFieldSchemaObject.superRefine(nullableValueRefine);
export { BsTextareaFieldSchemaObject };

// Select field
const BsSelectFieldSchemaObject = BsValueFieldBase.extend({
  type: z.literal('select'),
  nullable: z.boolean().optional(),
  value: z.string().nullable().optional(), // Bootstrap select only supports strings
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: BsSelectPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`BsSelectFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const BsSelectFieldSchema = BsSelectFieldSchemaObject.superRefine(nullableValueRefine);
export { BsSelectFieldSchemaObject };

// Checkbox field
export const BsCheckboxFieldSchema = BsValueFieldBase.extend({
  type: z.literal('checkbox'),
  value: z.boolean().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: BsCheckboxPropsSchema.optional(),
});

// Radio field
const BsRadioFieldSchemaObject = BsValueFieldBase.extend({
  type: z.literal('radio'),
  nullable: z.boolean().optional(),
  value: z.unknown().nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: BsRadioPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`BsRadioFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const BsRadioFieldSchema = BsRadioFieldSchemaObject.superRefine(nullableValueRefine);
export { BsRadioFieldSchemaObject };

// Multi-checkbox field
const BsMultiCheckboxFieldSchemaObject = BsValueFieldBase.extend({
  type: z.literal('multi-checkbox'),
  nullable: z.boolean().optional(),
  value: z.array(z.unknown()).nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: BsMultiCheckboxPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`BsMultiCheckboxFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const BsMultiCheckboxFieldSchema = BsMultiCheckboxFieldSchemaObject.superRefine(nullableValueRefine);
export { BsMultiCheckboxFieldSchemaObject };

// Toggle field
export const BsToggleFieldSchema = BsValueFieldBase.extend({
  type: z.literal('toggle'),
  value: z.boolean().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: BsTogglePropsSchema.optional(),
});

// Datepicker field
const BsDatepickerFieldSchemaObject = BsValueFieldBase.extend({
  type: z.literal('datepicker'),
  nullable: z.boolean().optional(),
  value: z.union([z.string(), z.null()]).optional(),
  minDate: z.union([z.string(), z.null()]).optional(),
  maxDate: z.union([z.string(), z.null()]).optional(),
  startAt: z.union([z.string(), z.null()]).optional(),
  placeholder: DynamicTextSchema.optional(),
  props: BsDatepickerPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`BsDatepickerFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const BsDatepickerFieldSchema = BsDatepickerFieldSchemaObject.superRefine(nullableValueRefine);
export { BsDatepickerFieldSchemaObject };

// Slider field
const BsSliderFieldSchemaObject = BsValueFieldBase.extend({
  type: z.literal('slider'),
  nullable: z.boolean().optional(),
  value: z.number().nullable().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  step: z.number().positive().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: BsSliderPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`BsSliderFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const BsSliderFieldSchema = BsSliderFieldSchemaObject.superRefine(nullableValueRefine);
export { BsSliderFieldSchemaObject };

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
