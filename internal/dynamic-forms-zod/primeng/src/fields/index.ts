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
import { nullableValueRefine } from '../../../src/lib/schemas/field/nullable-value.refinement';

const PrimeValueFieldBase = BaseFieldDefSchema.merge(FieldWithValidationSchema);

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

const PrimeInputFieldSchemaObject = PrimeValueFieldBase.extend({
  type: z.literal('input'),
  nullable: z.boolean().optional(),
  value: z.string().nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: PrimeInputPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`PrimeInputFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const PrimeInputFieldSchema = PrimeInputFieldSchemaObject.superRefine(nullableValueRefine);
export { PrimeInputFieldSchemaObject };

// Checkbox field
export const PrimeCheckboxFieldSchema = PrimeValueFieldBase.extend({
  type: z.literal('checkbox'),
  value: z.boolean().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: PrimeCheckboxPropsSchema.optional(),
});

// Radio field
const PrimeRadioFieldSchemaObject = PrimeValueFieldBase.extend({
  type: z.literal('radio'),
  nullable: z.boolean().optional(),
  value: z.unknown().nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: PrimeRadioPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`PrimeRadioFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const PrimeRadioFieldSchema = PrimeRadioFieldSchemaObject.superRefine(nullableValueRefine);
export { PrimeRadioFieldSchemaObject };

// Select field
const PrimeSelectFieldSchemaObject = PrimeValueFieldBase.extend({
  type: z.literal('select'),
  nullable: z.boolean().optional(),
  value: z.unknown().nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: PrimeSelectPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`PrimeSelectFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const PrimeSelectFieldSchema = PrimeSelectFieldSchemaObject.superRefine(nullableValueRefine);
export { PrimeSelectFieldSchemaObject };

// Multi-checkbox field
const PrimeMultiCheckboxFieldSchemaObject = PrimeValueFieldBase.extend({
  type: z.literal('multi-checkbox'),
  nullable: z.boolean().optional(),
  value: z.array(z.unknown()).nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  options: FieldOptionsSchema,
  props: PrimeMultiCheckboxPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`PrimeMultiCheckboxFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const PrimeMultiCheckboxFieldSchema = PrimeMultiCheckboxFieldSchemaObject.superRefine(nullableValueRefine);
export { PrimeMultiCheckboxFieldSchemaObject };

// Datepicker field
const PrimeDatepickerFieldSchemaObject = PrimeValueFieldBase.extend({
  type: z.literal('datepicker'),
  nullable: z.boolean().optional(),
  value: z.union([z.string(), z.null()]).optional(),
  minDate: z.union([z.string(), z.null()]).optional(),
  maxDate: z.union([z.string(), z.null()]).optional(),
  startAt: z.union([z.string(), z.null()]).optional(),
  placeholder: DynamicTextSchema.optional(),
  props: PrimeDatepickerPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`PrimeDatepickerFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const PrimeDatepickerFieldSchema = PrimeDatepickerFieldSchemaObject.superRefine(nullableValueRefine);
export { PrimeDatepickerFieldSchemaObject };

// Textarea field
const PrimeTextareaFieldSchemaObject = PrimeValueFieldBase.extend({
  type: z.literal('textarea'),
  nullable: z.boolean().optional(),
  value: z.string().nullable().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: PrimeTextareaPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`PrimeTextareaFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const PrimeTextareaFieldSchema = PrimeTextareaFieldSchemaObject.superRefine(nullableValueRefine);
export { PrimeTextareaFieldSchemaObject };

// Slider field
const PrimeSliderFieldSchemaObject = PrimeValueFieldBase.extend({
  type: z.literal('slider'),
  nullable: z.boolean().optional(),
  value: z.number().nullable().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  step: z.number().positive().optional(),
  placeholder: DynamicTextSchema.optional(),
  props: PrimeSliderPropsSchema.optional(),
});

/**
 * Publicly-used schema with cross-field nullable enforcement applied:
 * \`value: null\` is only valid when \`nullable: true\`.
 * The raw \`PrimeSliderFieldSchemaObject\` is used internally for discriminatedUnion composition.
 */
export const PrimeSliderFieldSchema = PrimeSliderFieldSchemaObject.superRefine(nullableValueRefine);
export { PrimeSliderFieldSchemaObject };

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
