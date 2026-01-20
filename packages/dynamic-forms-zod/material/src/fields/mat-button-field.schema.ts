import { z } from 'zod';
import { BaseFieldDefSchema } from '../../../src/lib/schemas/field/field-def.schema';
import { LogicArraySchema } from '../../../src/lib/schemas/logic/logic-config.schema';
import { MatButtonPropsSchema } from '../props/mat-button-props.schema';

/**
 * Event argument types for button events.
 */
export const EventArgSchema = z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()]);

/**
 * Schema for generic Material button field.
 *
 * Original interface:
 * ```typescript
 * interface ButtonField<TProps, TEvent> extends FieldDef<TProps> {
 *   type: 'button';
 *   event: FormEventConstructor<TEvent>;
 *   eventArgs?: EventArgs;
 * }
 * ```
 *
 * Note: The event property is a class constructor and cannot be serialized.
 * Use specific button types (submit, next, previous, etc.) for JSON configs.
 */
export const MatButtonFieldSchema = BaseFieldDefSchema.extend({
  /**
   * Field type discriminant.
   */
  type: z.literal('button'),

  /**
   * Event type name (string reference to registered event).
   * Note: Full event configuration requires runtime setup.
   */
  event: z.string().optional(),

  /**
   * Arguments passed to the event constructor.
   */
  eventArgs: z.array(EventArgSchema).optional(),

  /**
   * Material-specific button properties.
   */
  props: MatButtonPropsSchema.optional(),

  /**
   * Logic rules for conditional behavior.
   */
  logic: LogicArraySchema.optional(),
});

/**
 * Schema for Material submit button field.
 */
export const MatSubmitButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('submit'),
  props: MatButtonPropsSchema.optional(),
  logic: LogicArraySchema.optional(),
});

/**
 * Schema for Material next button field (multi-page forms).
 */
export const MatNextButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('next'),
  props: MatButtonPropsSchema.optional(),
  logic: LogicArraySchema.optional(),
});

/**
 * Schema for Material previous button field (multi-page forms).
 */
export const MatPreviousButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('previous'),
  props: MatButtonPropsSchema.optional(),
});

/**
 * Schema for add array item button field.
 */
export const MatAddArrayItemButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('addArrayItem'),
  /**
   * Key of the array field to add items to.
   * If omitted, uses the parent array context.
   */
  arrayKey: z.string().optional(),
  props: MatButtonPropsSchema.optional(),
});

/**
 * Schema for remove array item button field.
 */
export const MatRemoveArrayItemButtonFieldSchema = BaseFieldDefSchema.extend({
  type: z.literal('removeArrayItem'),
  /**
   * Key of the array field to remove items from.
   * If omitted, uses the parent array context.
   */
  arrayKey: z.string().optional(),
  props: MatButtonPropsSchema.optional(),
});

export type MatButtonFieldSchemaType = z.infer<typeof MatButtonFieldSchema>;
export type MatSubmitButtonFieldSchemaType = z.infer<typeof MatSubmitButtonFieldSchema>;
export type MatNextButtonFieldSchemaType = z.infer<typeof MatNextButtonFieldSchema>;
export type MatPreviousButtonFieldSchemaType = z.infer<typeof MatPreviousButtonFieldSchema>;
